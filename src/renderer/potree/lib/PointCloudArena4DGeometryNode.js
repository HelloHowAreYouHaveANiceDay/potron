import * as THREE from 'three';
import Potree from '../potree';

export default class PointCloudArena4DGeometryNode {
  constructor() {
    this.left = null;
    this.right = null;
    this.boundingBox = null;
    this.number = null;
    this.pcoGeometry = null;
    this.loaded = false;
    this.numPoints = 0;
    this.level = 0;
    this.children = [];
    this.oneTimeDisposeHandlers = [];
  }

  isGeometryNode() {
    return true;
  }

  isTreeNode() {
    return false;
  }

  isLoaded() {
    return this.loaded;
  }

  getBoundingSphere() {
    return this.boundingSphere;
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  getChildren() {
    const children = [];

    if (this.left) {
      children.push(this.left);
    }

    if (this.right) {
      children.push(this.right);
    }

    return children;
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  getLevel() {
    return this.level;
  }

  load() {
    if (this.loaded || this.loading) {
      return;
    }

    if (Potree.numNodesLoading >= Potree.maxNodesLoading) {
      return;
    }

    this.loading = true;

    Potree.numNodesLoading++;

    const url = `${this.pcoGeometry.url}?node=${this.number}`;
    const xhr = Potree.XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    const node = this;

    xhr.onreadystatechange = function () {
      if (!(xhr.readyState === 4 && xhr.status === 200)) {
        return;
      }

      const buffer = xhr.response;
      const sourceView = new DataView(buffer);
      const numPoints = buffer.byteLength / 17;
      const bytesPerPoint = 28;

      // const data = new ArrayBuffer(numPoints * bytesPerPoint);
      // const targetView = new DataView(data);

      // const attributes = [
      //   Potree.PointAttribute.POSITION_CARTESIAN,
      //   Potree.PointAttribute.RGBA_PACKED,
      //   Potree.PointAttribute.INTENSITY,
      //   Potree.PointAttribute.CLASSIFICATION,
      // ];


      const position = new Float32Array(numPoints * 3);
      const color = new Uint8Array(numPoints * 4);
      const intensities = new Float32Array(numPoints);
      const classifications = new Uint8Array(numPoints);
      const indices = new ArrayBuffer(numPoints * 4);
      const u32Indices = new Uint32Array(indices);

      const tightBoundingBox = new THREE.Box3();

      for (let i = 0; i < numPoints; i++) {
        const x = sourceView.getFloat32(i * 17 + 0, true) + node.boundingBox.min.x;
        const y = sourceView.getFloat32(i * 17 + 4, true) + node.boundingBox.min.y;
        const z = sourceView.getFloat32(i * 17 + 8, true) + node.boundingBox.min.z;

        const r = sourceView.getUint8(i * 17 + 12, true);
        const g = sourceView.getUint8(i * 17 + 13, true);
        const b = sourceView.getUint8(i * 17 + 14, true);

        const intensity = sourceView.getUint8(i * 17 + 15, true);

        const classification = sourceView.getUint8(i * 17 + 16, true);

        tightBoundingBox.expandByPoint(new THREE.Vector3(x, y, z));

        position[i * 3 + 0] = x;
        position[i * 3 + 1] = y;
        position[i * 3 + 2] = z;

        color[i * 4 + 0] = r;
        color[i * 4 + 1] = g;
        color[i * 4 + 2] = b;
        color[i * 4 + 3] = 255;

        intensities[i] = intensity;
        classifications[i] = classification;

        u32Indices[i] = i;
      }

      const geometry = new THREE.BufferGeometry();

      geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
      geometry.addAttribute('color', new THREE.BufferAttribute(color, 4, true));
      geometry.addAttribute('intensity', new THREE.BufferAttribute(intensities, 1));
      geometry.addAttribute('classification', new THREE.BufferAttribute(classifications, 1));
      {
        const bufferAttribute = new THREE.BufferAttribute(new Uint8Array(indices), 4, true);
        // bufferAttribute.normalized = true;
        geometry.addAttribute('indices', bufferAttribute);
      }

      node.geometry = geometry;
      node.numPoints = numPoints;
      node.loaded = true;
      node.loading = false;
      Potree.numNodesLoading--;
    };

    xhr.send(null);
  }

  dispose() {
    if (this.geometry && this.parent != null) {
      this.geometry.dispose();
      this.geometry = null;
      this.loaded = false;

      // this.dispatchEvent( { type: 'dispose' } );
      for (let i = 0; i < this.oneTimeDisposeHandlers.length; i++) {
        const handler = this.oneTimeDisposeHandlers[i];
        handler();
      }
      this.oneTimeDisposeHandlers = [];
    }
  }

  getNumPoints() {
    return this.numPoints;
  }
}
