import * as THREE from 'three';

import EventDispatcher from './EventDispatcher.js';

import Potree from '../potree';


export default class PointCloudArena4DGeometry extends EventDispatcher {
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
      const numNodes = buffer.byteLength / 3;
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
}
