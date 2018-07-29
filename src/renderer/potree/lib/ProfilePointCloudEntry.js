import * as THREE from 'three';

import PointColorType from './PointColorType';
import PointCloudMaterial from './PointCloudMaterial';


export default class ProfilePointCloudEntry {
  constructor() {
    this.points = [];

    // let geometry = new THREE.BufferGeometry();
    const material = ProfilePointCloudEntry.getMaterialInstance();
    material.uniforms.minSize.value = 2;
    material.uniforms.maxSize.value = 2;
    material.pointColorType = PointColorType.RGB;
    material.opacity = 1.0;

    this.material = material;

    this.sceneNode = new THREE.Object3D();
    // this.sceneNode = new THREE.Points(geometry, material);
  }

  static releaseMaterialInstance(instance) {
    ProfilePointCloudEntry.materialPool.add(instance);
  }

  static getMaterialInstance() {
    let instance = ProfilePointCloudEntry.materialPool.values().next().value;
    if (!instance) {
      instance = new PointCloudMaterial();
    } else {
      ProfilePointCloudEntry.materialPool.delete(instance);
    }

    return instance;
  }

  dispose() {
    for (const child of this.sceneNode.children) {
      ProfilePointCloudEntry.releaseMaterialInstance(child.material);
      child.geometry.dispose();
    }

    this.sceneNode.children = [];
  }

  addPoints(data) {
    this.points.push(data);

    const batchSize = 10 * 1000;

    const createNewBatch = () => {
      const geometry = new THREE.BufferGeometry();

      const buffers = {
        position: new Float32Array(3 * batchSize),
        color: new Uint8Array(4 * batchSize),
        intensity: new Uint16Array(batchSize),
        classification: new Uint8Array(batchSize),
        returnNumber: new Uint8Array(batchSize),
        numberOfReturns: new Uint8Array(batchSize),
        pointSourceID: new Uint16Array(batchSize),
      };

      geometry.addAttribute('position', new THREE.BufferAttribute(buffers.position, 3));
      geometry.addAttribute('color', new THREE.BufferAttribute(buffers.color, 4, true));
      geometry.addAttribute('intensity', new THREE.BufferAttribute(buffers.intensity, 1, false));
      geometry.addAttribute('classification', new THREE.BufferAttribute(buffers.classification, 1, false));
      geometry.addAttribute('returnNumber', new THREE.BufferAttribute(buffers.returnNumber, 1, false));
      geometry.addAttribute('numberOfReturns', new THREE.BufferAttribute(buffers.numberOfReturns, 1, false));
      geometry.addAttribute('pointSourceID', new THREE.BufferAttribute(buffers.pointSourceID, 1, false));

      geometry.drawRange.start = 0;
      geometry.drawRange.count = 0;

      this.currentBatch = new THREE.Points(geometry, this.material);
      this.sceneNode.add(this.currentBatch);
    };

    if (!this.currentBatch) {
      createNewBatch();
    }

    { // REBUILD MODEL
      // const pointsProcessed = 0;
      let updateRange = {
        start: this.currentBatch.geometry.drawRange.count,
        count: 0,
      };

      const projectedBox = new THREE.Box3();

      for (let i = 0; i < data.numPoints; i++) {
        if (updateRange.start + updateRange.count >= batchSize) {
          // finalize current batch, start new batch

          for (const key of Object.keys(this.currentBatch.geometry.attributes)) {
            const attribute = this.currentBatch.geometry.attributes[key];
            attribute.updateRange.offset = updateRange.start;
            attribute.updateRange.count = updateRange.count;
            attribute.needsUpdate = true;
          }
          this.currentBatch.geometry.computeBoundingBox();
          this.currentBatch.geometry.computeBoundingSphere();

          createNewBatch();
          updateRange = {
            start: 0,
            count: 0,
          };
        }


        const x = data.data.mileage[i];
        const y = 0;
        const z = data.data.position[3 * i + 2];

        projectedBox.expandByPoint(new THREE.Vector3(x, y, z));

        const currentIndex = updateRange.start + updateRange.count;

        const attributes = this.currentBatch.geometry.attributes;

        {
          attributes.position.array[3 * currentIndex + 0] = x;
          attributes.position.array[3 * currentIndex + 1] = y;
          attributes.position.array[3 * currentIndex + 2] = z;
        }

        if (data.data.color) {
          attributes.color.array[4 * currentIndex + 0] = data.data.color[4 * i + 0];
          attributes.color.array[4 * currentIndex + 1] = data.data.color[4 * i + 1];
          attributes.color.array[4 * currentIndex + 2] = data.data.color[4 * i + 2];
          attributes.color.array[4 * currentIndex + 3] = 255;
        }

        if (data.data.intensity) {
          attributes.intensity.array[currentIndex] = data.data.intensity[i];
        }

        if (data.data.classification) {
          attributes.classification.array[currentIndex] = data.data.classification[i];
        }

        if (data.data.returnNumber) {
          attributes.returnNumber.array[currentIndex] = data.data.returnNumber[i];
        }

        if (data.data.numberOfReturns) {
          attributes.numberOfReturns.array[currentIndex] = data.data.numberOfReturns[i];
        }

        if (data.data.pointSourceID) {
          attributes.pointSourceID.array[currentIndex] = data.data.pointSourceID[i];
        }

        updateRange.count++;
        this.currentBatch.geometry.drawRange.count++;
      }

      // for(let attribute of Object.values(this.currentBatch.geometry.attributes)){
      for (const key of Object.keys(this.currentBatch.geometry.attributes)) {
        const attribute = this.currentBatch.geometry.attributes[key];
        attribute.updateRange.offset = updateRange.start;
        attribute.updateRange.count = updateRange.count;
        attribute.needsUpdate = true;
      }

      data.projectedBox = projectedBox;

      this.projectedBox = this.points.reduce((a, i) => a.union(i.projectedBox), new THREE.Box3());
    }
  }
}
