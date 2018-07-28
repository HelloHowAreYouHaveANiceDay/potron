import * as THREE from 'three';

export default class ProfileData {
  constructor(profile) {
    this.profile = profile;

    this.segments = [];
    this.boundingBox = new THREE.Box3();

    for (let i = 0; i < profile.points.length - 1; i++) {
      const start = profile.points[i];
      const end = profile.points[i + 1];

      const startGround = new THREE.Vector3(start.x, start.y, 0);
      const endGround = new THREE.Vector3(end.x, end.y, 0);

      const center = new THREE.Vector3().addVectors(endGround, startGround).multiplyScalar(0.5);
      const length = startGround.distanceTo(endGround);
      const side = new THREE.Vector3().subVectors(endGround, startGround).normalize();
      const up = new THREE.Vector3(0, 0, 1);
      const forward = new THREE.Vector3().crossVectors(side, up).normalize();
      const N = forward;
      const cutPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(N, startGround);
      const halfPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(side, center);

      const segment = {
        start,
        end,
        cutPlane,
        halfPlane,
        length,
        points: new Points(),
      };

      this.segments.push(segment);
    }
  }

  size() {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.points.numPoints;
    }

    return size;
  }
}
