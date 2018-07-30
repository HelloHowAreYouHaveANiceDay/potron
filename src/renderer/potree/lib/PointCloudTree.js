import * as THREE from 'three';

// https://threejs.org/docs/#api/core/Object3D

class PointCloudTree extends THREE.Object3D {
  // constructor() {
  //   super();
  // }

  initialized() {
    return this.root !== null;
  }
}

export default PointCloudTree;
