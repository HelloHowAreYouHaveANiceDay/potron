import * as THREE from 'three';
import Volume from './Volume';

class SphereVolume extends Volume {
  constructor(args = {}) {
    super(args);

    this.constructor.counter = (this.constructor.counter === undefined) ? 0 : this.constructor.counter + 1;
    this.name = `sphere_${this.constructor.counter}`;

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    sphereGeometry.computeBoundingBox();

    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      depthTest: true,
      depthWrite: false,
    });
    this.sphere = new THREE.Mesh(sphereGeometry, this.material);
    this.sphere.visible = false;
    this.sphere.geometry.computeBoundingBox();
    this.boundingBox = this.sphere.geometry.boundingBox;
    this.add(this.sphere);

    this.label.visible = false;


    const frameGeometry = new THREE.Geometry();
    {
      const steps = 64;
      const uSegments = 8;
      const vSegments = 5;
      // const r = 1;

      for (let uSegment = 0; uSegment < uSegments; uSegment++) {
        const alpha = (uSegment / uSegments) * Math.PI * 2;
        const dirx = Math.cos(alpha);
        const diry = Math.sin(alpha);

        for (let i = 0; i <= steps; i++) {
          const v = (i / steps) * Math.PI * 2;
          const vNext = v + 2 * Math.PI / steps;

          const height = Math.sin(v);
          const xyAmount = Math.cos(v);

          const heightNext = Math.sin(vNext);
          const xyAmountNext = Math.cos(vNext);

          const vertex = new THREE.Vector3(dirx * xyAmount, diry * xyAmount, height);
          frameGeometry.vertices.push(vertex);

          const vertexNext = new THREE.Vector3(dirx * xyAmountNext, diry * xyAmountNext, heightNext);
          frameGeometry.vertices.push(vertexNext);
        }
      }

      // creates rings at poles, just because it's easier to implement
      for (let vSegment = 0; vSegment <= vSegments + 1; vSegment++) {
        // let height = (vSegment / (vSegments + 1)) * 2 - 1; // -1 to 1
        let uh = (vSegment / (vSegments + 1)); // -1 to 1
        uh = (1 - uh) * (-Math.PI / 2) + uh * (Math.PI / 2);
        const height = Math.sin(uh);

        console.log(uh, height);

        for (let i = 0; i <= steps; i++) {
          const u = (i / steps) * Math.PI * 2;
          const uNext = u + 2 * Math.PI / steps;

          const dirx = Math.cos(u);
          const diry = Math.sin(u);

          const dirxNext = Math.cos(uNext);
          const diryNext = Math.sin(uNext);

          const xyAmount = Math.sqrt(1 - height * height);

          const vertex = new THREE.Vector3(dirx * xyAmount, diry * xyAmount, height);
          frameGeometry.vertices.push(vertex);

          const vertexNext = new THREE.Vector3(dirxNext * xyAmount, diryNext * xyAmount, height);
          frameGeometry.vertices.push(vertexNext);
        }
      }
    }

    this.frame = new THREE.LineSegments(frameGeometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
    this.add(this.frame);

    const frameMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x000000 });
    this.frame = new THREE.Mesh(sphereGeometry, frameMaterial);
    // this.add(this.frame);

    // this.frame = new THREE.LineSegments(boxFrameGeometry, new THREE.LineBasicMaterial({color: 0x000000}));
    // this.frame.mode = THREE.Lines;
    // this.add(this.frame);

    this.update();
  }

  update() {
    this.boundingBox = this.sphere.geometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new THREE.Sphere());

    // if (this._clip) {
    //	this.sphere.visible = false;
    //	this.label.visible = false;
    // } else {
    //	this.sphere.visible = true;
    //	this.label.visible = this.showVolumeLabel;
    // }
  }

  raycast(raycaster, intersects) {
    const is = [];
    this.sphere.raycast(raycaster, is);

    if (is.length > 0) {
      const I = is[0];
      intersects.push({
        distance: I.distance,
        object: this,
        point: I.point.clone(),
      });
    }
  }

  // see https://en.wikipedia.org/wiki/Ellipsoid#Volume
  getVolume() {
    return (4 / 3) * Math.PI * this.scale.x * this.scale.y * this.scale.z;
  }
}

export default SphereVolume;
