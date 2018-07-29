import * as THREE from 'three';

class PointCloudTree extends THREE.Object3D {
  constructor() {
    super();
  }

  initialized() {
    return this.root !== null;
  }
}

export default PointCloudTree;
