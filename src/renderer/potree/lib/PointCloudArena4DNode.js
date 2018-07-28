import * as THREE from 'three';

import PointCloudTreeNode from './PointCloudTreeNode';

class PointCloudArena4DNode extends PointCloudTreeNode {
  constructor() {
    super();

    this.left = null;
    this.right = null;
    this.sceneNode = null;
    this.kdtree = null;
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

  toTreeNode(child) {
    let geometryNode = null;

    if (this.left === child) {
      geometryNode = this.left;
    } else if (this.right === child) {
      geometryNode = this.right;
    }

    if (!geometryNode.loaded) {
      return;
    }

    let node = new PointCloudArena4DNode();
    let sceneNode = THREE.PointCloud(geometryNode.geometry, this.kdtree.material);
    sceneNode.visible = false;

    node.kdtree = this.kdtree;
    node.geometryNode = geometryNode;
    node.sceneNode = sceneNode;
    node.parent = this;
    node.left = this.geometryNode.left;
    node.right = this.geometryNode.right;
  }

  getChildren() {
    let children = [];

    if (this.left) {
      children.push(this.left);
    }

    if (this.right) {
      children.push(this.right);
    }

    return children;
  }
}

export default PointCloudArena4DNode;