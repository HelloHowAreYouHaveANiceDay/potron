import * as THREE from 'three';

import Potree from '../potree';

export default class LasLazBatcher {
  constructor(node) {
    this.node = node;
  }

  push(lasBuffer) {
    const workerPath = `${Potree.scriptPath}/workers/LASDecoderWorker.js`;
    const worker = Potree.workerPool.getWorker(workerPath);
    // const node = this.node;

    worker.onmessage = (e) => {
      const geometry = new THREE.BufferGeometry();
      const numPoints = lasBuffer.pointsCount;

      const positions = new Float32Array(e.data.position);
      const colors = new Uint8Array(e.data.color);
      const intensities = new Float32Array(e.data.intensity);
      const classifications = new Uint8Array(e.data.classification);
      const returnNumbers = new Uint8Array(e.data.returnNumber);
      const numberOfReturns = new Uint8Array(e.data.numberOfReturns);
      const pointSourceIDs = new Uint16Array(e.data.pointSourceID);
      const indices = new Uint8Array(e.data.indices);

      geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));
      geometry.addAttribute('intensity', new THREE.BufferAttribute(intensities, 1));
      geometry.addAttribute('classification', new THREE.BufferAttribute(classifications, 1));
      geometry.addAttribute('returnNumber', new THREE.BufferAttribute(returnNumbers, 1));
      geometry.addAttribute('numberOfReturns', new THREE.BufferAttribute(numberOfReturns, 1));
      geometry.addAttribute('pointSourceID', new THREE.BufferAttribute(pointSourceIDs, 1));
      // geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(numPoints * 3), 3));
      geometry.addAttribute('indices', new THREE.BufferAttribute(indices, 4));
      geometry.attributes.indices.normalized = true;

      const tightBoundingBox = new THREE.Box3(
        new THREE.Vector3().fromArray(e.data.tightBoundingBox.min),
        new THREE.Vector3().fromArray(e.data.tightBoundingBox.max),
      );

      geometry.boundingBox = this.node.boundingBox;
      this.node.tightBoundingBox = tightBoundingBox;

      this.node.geometry = geometry;
      this.node.numPoints = numPoints;
      this.node.loaded = true;
      this.node.loading = false;
      Potree.numNodesLoading--;
      this.node.mean = new THREE.Vector3(...e.data.mean);

      // debugger;

      Potree.workerPool.returnWorker(workerPath, worker);
    };

    const message = {
      buffer: lasBuffer.arrayb,
      numPoints: lasBuffer.pointsCount,
      pointSize: lasBuffer.pointSize,
      pointFormatID: 2,
      scale: lasBuffer.scale,
      offset: lasBuffer.offset,
      mins: lasBuffer.mins,
      maxs: lasBuffer.maxs,
    };
    worker.postMessage(message, [message.buffer]);
  }
}
