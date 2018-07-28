import * as THREE from 'three';

import Utils from './Utils';

class Profile extends THREE.Object3D {
  constructor() {
    super();

    this.constructor.counter = (this.constructor.counter === undefined) ? 0 : this.constructor.counter + 1;

    this.name = `Profile_${this.constructor.counter}`;
    this.points = [];
    this.spheres = [];
    this.edges = [];
    this.boxes = [];
    this.width = 1;
    this.height = 20;
    this._modifiable = true;

    this.sphereGeometry = new THREE.SphereGeometry(0.4, 10, 10);
    this.color = new THREE.Color(0xff0000);
    this.lineColor = new THREE.Color(0xff0000);
  }

  createSphereMaterial() {
    const sphereMaterial = new THREE.MeshLambertMaterial({
      // shading: THREE.SmoothShading,
      color: 0xff0000,
      depthTest: false,
      depthWrite: false,
    },
    );

    return sphereMaterial;
  }

  getSegments() {
    const segments = [];

    for (let i = 0; i < this.points.length - 1; i++) {
      const start = this.points[i].clone();
      const end = this.points[i + 1].clone();
      segments.push({ start, end });
    }

    return segments;
  }

  getSegmentMatrices() {
    const segments = this.getSegments();
    const matrices = [];

    for (const segment of segments) {
      const { start, end } = segment;

      const box = new THREE.Object3D();

      const length = start.clone().setZ(0).distanceTo(end.clone().setZ(0));
      box.scale.set(length, 10000, this.width);
      box.up.set(0, 0, 1);

      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const diff = new THREE.Vector3().subVectors(end, start);
      const target = new THREE.Vector3(diff.y, -diff.x, 0);

      box.position.set(0, 0, 0);
      box.lookAt(target);
      box.position.copy(center);

      box.updateMatrixWorld();
      matrices.push(box.matrixWorld);
    }

    return matrices;
  }

  addMarker(point) {
    this.points.push(point);

    const sphere = new THREE.Mesh(this.sphereGeometry, this.createSphereMaterial());

    this.add(sphere);
    this.spheres.push(sphere);

    // edges & boxes
    if (this.points.length > 1) {
      const lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
      lineGeometry.colors.push(this.lineColor, this.lineColor, this.lineColor);
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        linewidth: 2,
        transparent: true,
        opacity: 0.4,
      });
      lineMaterial.depthTest = false;
      const edge = new THREE.Line(lineGeometry, lineMaterial);
      edge.visible = false;

      this.add(edge);
      this.edges.push(edge);

      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.visible = false;

      this.add(box);
      this.boxes.push(box);
    }

    { // event listeners
      const drag = (e) => {
        const I = Utils.getMousePointCloudIntersection(
          e.drag.end,
          e.viewer.scene.getActiveCamera(),
          e.viewer,
          e.viewer.scene.pointclouds);

        if (I) {
          const i = this.spheres.indexOf(e.drag.object);
          if (i !== -1) {
            this.setPosition(i, I.location);
            // this.dispatchEvent({
            //	'type': 'marker_moved',
            //	'profile': this,
            //	'index': i
            // });
          }
        }
      };

      const drop = (e) => {
        const i = this.spheres.indexOf(e.drag.object);
        if (i !== -1) {
          this.dispatchEvent({
            type: 'marker_dropped',
            profile: this,
            index: i,
          });
        }
      };

      const mouseover = e => e.object.material.emissive.setHex(0x888888);
      const mouseleave = e => e.object.material.emissive.setHex(0x000000);

      sphere.addEventListener('drag', drag);
      sphere.addEventListener('drop', drop);
      sphere.addEventListener('mouseover', mouseover);
      sphere.addEventListener('mouseleave', mouseleave);
    }

    const event = {
      type: 'marker_added',
      profile: this,
      sphere,
    };
    this.dispatchEvent(event);

    this.setPosition(this.points.length - 1, point);
  }

  removeMarker(index) {
    this.points.splice(index, 1);

    this.remove(this.spheres[index]);

    const edgeIndex = (index === 0) ? 0 : (index - 1);
    this.remove(this.edges[edgeIndex]);
    this.edges.splice(edgeIndex, 1);
    this.remove(this.boxes[edgeIndex]);
    this.boxes.splice(edgeIndex, 1);

    this.spheres.splice(index, 1);

    this.update();

    this.dispatchEvent({
      type: 'marker_removed',
      profile: this,
    });
  }

  setPosition(index, position) {
    const point = this.points[index];
    point.copy(position);

    const event = {
      type: 'marker_moved',
      profile: this,
      index,
      position: point.clone(),
    };
    this.dispatchEvent(event);

    this.update();
  }

  setWidth(width) {
    this.width = width;

    const event = {
      type: 'width_changed',
      profile: this,
      width,
    };
    this.dispatchEvent(event);

    this.update();
  }

  getWidth() {
    return this.width;
  }

  update() {
    if (this.points.length === 0) {
      return;
    } else if (this.points.length === 1) {
      const point = this.points[0];
      this.spheres[0].position.copy(point);

      return;
    }

    const min = this.points[0].clone();
    const max = this.points[0].clone();
    const centroid = new THREE.Vector3();
    const lastIndex = this.points.length - 1;
    for (let i = 0; i <= lastIndex; i++) {
      const point = this.points[i];
      const sphere = this.spheres[i];
      const leftIndex = (i === 0) ? lastIndex : i - 1;
      // let rightIndex = (i === lastIndex) ? 0 : i + 1;
      const leftVertex = this.points[leftIndex];
      // let rightVertex = this.points[rightIndex];
      const leftEdge = this.edges[leftIndex];
      const rightEdge = this.edges[i];
      const leftBox = this.boxes[leftIndex];
      // rightBox = this.boxes[i];

      // let leftEdgeLength = point.distanceTo(leftVertex);
      // let rightEdgeLength = point.distanceTo(rightVertex);
      // let leftEdgeCenter = new THREE.Vector3().addVectors(leftVertex, point).multiplyScalar(0.5);
      // let rightEdgeCenter = new THREE.Vector3().addVectors(point, rightVertex).multiplyScalar(0.5);

      sphere.position.copy(point);

      if (this._modifiable) {
        sphere.visible = true;
      } else {
        sphere.visible = false;
      }

      if (leftEdge) {
        leftEdge.geometry.vertices[1].copy(point);
        leftEdge.geometry.verticesNeedUpdate = true;
        leftEdge.geometry.computeBoundingSphere();
      }

      if (rightEdge) {
        rightEdge.geometry.vertices[0].copy(point);
        rightEdge.geometry.verticesNeedUpdate = true;
        rightEdge.geometry.computeBoundingSphere();
      }

      if (leftBox) {
        const start = leftVertex;
        const end = point;
        const length = start.clone().setZ(0).distanceTo(end.clone().setZ(0));
        leftBox.scale.set(length, 1000000, this.width);
        leftBox.up.set(0, 0, 1);

        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const diff = new THREE.Vector3().subVectors(end, start);
        const target = new THREE.Vector3(diff.y, -diff.x, 0);

        leftBox.position.set(0, 0, 0);
        leftBox.lookAt(target);
        leftBox.position.copy(center);
      }

      centroid.add(point);
      min.min(point);
      max.max(point);
    }
    centroid.multiplyScalar(1 / this.points.length);

    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];

      box.position.z = min.z + (max.z - min.z) / 2;
    }
  }

  raycast(raycaster, intersects) {
    for (let i = 0; i < this.points.length; i++) {
      const sphere = this.spheres[i];

      sphere.raycast(raycaster, intersects);
    }

    // recalculate distances because they are not necessarely correct
    // for scaled objects.
    // see https://github.com/mrdoob/three.js/issues/5827
    // TODO: remove this once the bug has been fixed
    for (let i = 0; i < intersects.length; i++) {
      const I = intersects[i];
      I.distance = raycaster.ray.origin.distanceTo(I.point);
    }
    intersects.sort((a, b) => a.distance - b.distance);
  }

  get modifiable() {
    return this._modifiable;
  }

  set modifiable(value) {
    this._modifiable = value;
    this.update();
  }
}

export default Profile;
