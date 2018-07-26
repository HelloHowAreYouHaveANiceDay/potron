

import { EventDispatcher } from '../EventDispatcher.js';

Potree.PointCloudArena4DGeometryNode = class PointCloudArena4DGeometryNode {
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

      const data = new ArrayBuffer(numPoints * bytesPerPoint);
      const targetView = new DataView(data);

      const attributes = [
        Potree.PointAttribute.POSITION_CARTESIAN,
        Potree.PointAttribute.RGBA_PACKED,
        Potree.PointAttribute.INTENSITY,
        Potree.PointAttribute.CLASSIFICATION,
      ];


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
};


Potree.PointCloudArena4DGeometry = class PointCloudArena4DGeometry extends EventDispatcher {
  constructor() {
    super();

    this.numPoints = 0;
    this.version = 0;
    this.boundingBox = null;
    this.numNodes = 0;
    this.name = null;
    this.provider = null;
    this.url = null;
    this.root = null;
    this.levels = 0;
    this._spacing = null;
    this.pointAttributes = new Potree.PointAttributes([
      'POSITION_CARTESIAN',
      'COLOR_PACKED',
    ]);
  }

  static load(url, callback) {
    const xhr = Potree.XHRFactory.createXMLHttpRequest();
    xhr.open('GET', `${url}?info`, true);

    xhr.onreadystatechange = function () {
      try {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);

          const geometry = new Potree.PointCloudArena4DGeometry();
          geometry.url = url;
          geometry.name = response.Name;
          geometry.provider = response.Provider;
          geometry.numNodes = response.Nodes;
          geometry.numPoints = response.Points;
          geometry.version = response.Version;
          geometry.boundingBox = new THREE.Box3(
            new THREE.Vector3().fromArray(response.BoundingBox.slice(0, 3)),
            new THREE.Vector3().fromArray(response.BoundingBox.slice(3, 6)),
          );
          if (response.Spacing) {
            geometry.spacing = response.Spacing;
          }

          const offset = geometry.boundingBox.min.clone().multiplyScalar(-1);

          geometry.boundingBox.min.add(offset);
          geometry.boundingBox.max.add(offset);
          geometry.offset = offset;

          const center = geometry.boundingBox.getCenter(new THREE.Vector3());
          const radius = geometry.boundingBox.getSize(new THREE.Vector3()).length() / 2;
          geometry.boundingSphere = new THREE.Sphere(center, radius);

          geometry.loadHierarchy();

          callback(geometry);
        } else if (xhr.readyState === 4) {
          callback(null);
        }
      } catch (e) {
        console.error(e.message);
        callback(null);
      }
    };

    xhr.send(null);
  }

  loadHierarchy() {
    const url = `${this.url}?tree`;
    const xhr = Potree.XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onreadystatechange = () => {
      if (!(xhr.readyState === 4 && xhr.status === 200)) {
        return;
      }

      const buffer = xhr.response;
      const numNodes = buffer.byteLength /	3;
      const view = new DataView(buffer);
      const stack = [];
      let root = null;

      let levels = 0;

      // TODO Debug: let start = new Date().getTime();
      // read hierarchy
      for (let i = 0; i < numNodes; i++) {
        const mask = view.getUint8(i * 3 + 0, true);
        // TODO Unused: let numPoints = view.getUint16(i * 3 + 1, true);

        const hasLeft = (mask & 1) > 0;
        const hasRight = (mask & 2) > 0;
        const splitX = (mask & 4) > 0;
        const splitY = (mask & 8) > 0;
        const splitZ = (mask & 16) > 0;
        let split = null;
        if (splitX) {
          split = 'X';
        } else if (splitY) {
          split = 'Y';
        } if (splitZ) {
          split = 'Z';
        }

        const node = new Potree.PointCloudArena4DGeometryNode();
        node.hasLeft = hasLeft;
        node.hasRight = hasRight;
        node.split = split;
        node.isLeaf = !hasLeft && !hasRight;
        node.number = i;
        node.left = null;
        node.right = null;
        node.pcoGeometry = this;
        node.level = stack.length;
        levels = Math.max(levels, node.level);

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          node.boundingBox = parent.boundingBox.clone();
          const parentBBSize = parent.boundingBox.getSize(new THREE.Vector3());

          if (parent.hasLeft && !parent.left) {
            parent.left = node;
            parent.children.push(node);

            if (parent.split === 'X') {
              node.boundingBox.max.x = node.boundingBox.min.x + parentBBSize.x / 2;
            } else if (parent.split === 'Y') {
              node.boundingBox.max.y = node.boundingBox.min.y + parentBBSize.y / 2;
            } else if (parent.split === 'Z') {
              node.boundingBox.max.z = node.boundingBox.min.z + parentBBSize.z / 2;
            }

            const center = node.boundingBox.getCenter(new THREE.Vector3());
            const radius = node.boundingBox.getSize(new THREE.Vector3()).length() / 2;
            node.boundingSphere = new THREE.Sphere(center, radius);
          } else {
            parent.right = node;
            parent.children.push(node);

            if (parent.split === 'X') {
              node.boundingBox.min.x = node.boundingBox.min.x + parentBBSize.x / 2;
            } else if (parent.split === 'Y') {
              node.boundingBox.min.y = node.boundingBox.min.y + parentBBSize.y / 2;
            } else if (parent.split === 'Z') {
              node.boundingBox.min.z = node.boundingBox.min.z + parentBBSize.z / 2;
            }

            const center = node.boundingBox.getCenter(new THREE.Vector3());
            const radius = node.boundingBox.getSize(new THREE.Vector3()).length() / 2;
            node.boundingSphere = new THREE.Sphere(center, radius);
          }
        } else {
          root = node;
          root.boundingBox = this.boundingBox.clone();
          const center = root.boundingBox.getCenter(new THREE.Vector3());
          const radius = root.boundingBox.getSize(new THREE.Vector3()).length() / 2;
          root.boundingSphere = new THREE.Sphere(center, radius);
        }

        const bbSize = node.boundingBox.getSize(new THREE.Vector3());
        node.spacing = ((bbSize.x + bbSize.y + bbSize.z) / 3) / 75;
        node.estimatedSpacing = node.spacing;

        stack.push(node);

        if (node.isLeaf) {
          let done = false;
          while (!done && stack.length > 0) {
            stack.pop();

            const top = stack[stack.length - 1];

            done = stack.length > 0 && top.hasRight && top.right == null;
          }
        }
      }
      // TODO Debug:
      // let end = new Date().getTime();
      // let parseDuration = end - start;
      // let msg = parseDuration;
      // document.getElementById("lblDebug").innerHTML = msg;

      this.root = root;
      this.levels = levels;
      // console.log(this.root);

      this.dispatchEvent({ type: 'hierarchy_loaded' });
    };

    xhr.send(null);
  }

  get spacing() {
    if (this._spacing) {
      return this._spacing;
    } else if (this.root) {
      return this.root.spacing;
    }
    // TODO ???: null;
  }

  set spacing(value) {
    this._spacing = value;
  }
};

