import * as THREE from 'three';
import PointCloudTreeNode from './PointCloudTreeNode';

class PointCloudOctreeNode extends PointCloudTreeNode {
  constructor() {
    super();

    // this.children = {};
    this.children = [];
    this.sceneNode = null;
    this.octree = null;
  }

  getNumPoints() {
    return this.geometryNode.numPoints;
  }

  isLoaded() {
    return true;
  }

  isTreeNode() {
    return true;
  }

  isGeometryNode() {
    return false;
  }

  getLevel() {
    return this.geometryNode.level;
  }

  getBoundingSphere() {
    return this.geometryNode.boundingSphere;
  }

  getBoundingBox() {
    return this.geometryNode.boundingBox;
  }

  getChildren() {
    const children = [];

    for (let i = 0; i < 8; i++) {
      if (this.children[i]) {
        children.push(this.children[i]);
      }
    }

    return children;
  }

  getPointsInBox(boxNode) {
    if (!this.sceneNode) {
      return null;
    }

    const buffer = this.geometryNode.buffer;

    const posOffset = buffer.offset('position');
    const stride = buffer.stride;
    const view = new DataView(buffer.data);

    const worldToBox = new THREE.Matrix4().getInverse(boxNode.matrixWorld);
    const objectToBox = new THREE.Matrix4().multiplyMatrices(worldToBox, this.sceneNode.matrixWorld);

    const inBox = [];

    const pos = new THREE.Vector4();
    for (let i = 0; i < buffer.numElements; i++) {
      const x = view.getFloat32(i * stride + posOffset + 0, true);
      const y = view.getFloat32(i * stride + posOffset + 4, true);
      const z = view.getFloat32(i * stride + posOffset + 8, true);

      pos.set(x, y, z, 1);
      pos.applyMatrix4(objectToBox);

      if (pos.x > -0.5 && pos.x < 0.5) {
        if (pos.y > -0.5 && pos.y < 0.5) {
          if (pos.z > -0.5 && pos.z < 0.5) {
            pos.set(x, y, z, 1).applyMatrix4(this.sceneNode.matrixWorld);
            inBox.push(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        }
      }
    }

    return inBox;
  }

  get name() {
    return this.geometryNode.name;
  }
}

export default PointCloudOctreeNode;
