import * as THREE from 'three';
import Volume from './Volume';

class BoxVolume extends Volume {

  constructor(args = {}) {
    super(args);

    this.constructor.counter = (this.constructor.counter === undefined) ? 0 : this.constructor.counter + 1;
    this.name = 'box_' + this.constructor.counter;

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    boxGeometry.computeBoundingBox();

    let boxFrameGeometry = new THREE.Geometry();
    {
      // bottom
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0.5));
      // top
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, 0.5));
      // sides
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, 0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(0.5, 0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5));
      boxFrameGeometry.vertices.push(new THREE.Vector3(-0.5, 0.5, -0.5));
    }

    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      depthTest: true,
      depthWrite: false
    });
    this.box = new THREE.Mesh(boxGeometry, this.material);
    this.box.geometry.computeBoundingBox();
    this.boundingBox = this.box.geometry.boundingBox;
    this.add(this.box);

    this.frame = new THREE.LineSegments(boxFrameGeometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
    // this.frame.mode = THREE.Lines;
    this.add(this.frame);

    this.update();
  }

  update() {
    this.boundingBox = this.box.geometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new THREE.Sphere());

    if (this._clip) {
      this.box.visible = false;
      this.label.visible = false;
    } else {
      this.box.visible = true;
      this.label.visible = this.showVolumeLabel;
    }
  }

  raycast(raycaster, intersects) {
    let is = [];
    this.box.raycast(raycaster, is);

    if (is.length > 0) {
      let I = is[0];
      intersects.push({
        distance: I.distance,
        object: this,
        point: I.point.clone()
      });
    }
  }

  getVolume() {
    return Math.abs(this.scale.x * this.scale.y * this.scale.z);
  }

}

export default BoxVolume;
