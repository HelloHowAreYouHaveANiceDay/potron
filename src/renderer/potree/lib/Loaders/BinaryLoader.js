import * as THREE from 'three';


import PointAttributeNames from './PointAttributeNames';

import XHRFactory from '../XHRFactory';
import Version from '../Version';

import Potree from '../../potree';

export default class BinaryLoader {
  constructor(version, boundingBox, scale) {
    if (typeof (version) === 'string') {
      this.version = new Version(version);
    } else {
      this.version = version;
    }

    this.boundingBox = boundingBox;
    this.scale = scale;
  }

  load(node) {
    if (node.loaded) {
      return;
    }

    let url = node.getURL();

    if (this.version.equalOrHigher('1.4')) {
      url += '.bin';
    }

    const xhr = XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status === 200 || xhr.status === 0) && xhr.response !== null) {
          const buffer = xhr.response;
          this.parse(node, buffer);
        } else {
          throw new Error(`Failed to load file! HTTP status: ${xhr.status}, file: ${url}`);
        }
      }
    };

    try {
      xhr.send(null);
    } catch (e) {
      console.log(`fehler beim laden der punktwolke: ${e}`);
    }
  }

  parse(node, buffer) {
    const pointAttributes = node.pcoGeometry.pointAttributes;
    const numPoints = buffer.byteLength / node.pcoGeometry.pointAttributes.byteSize;

    if (this.version.upTo('1.5')) {
      node.numPoints = numPoints;
    }

    const workerPath = `${Potree.scriptPath}/workers/BinaryDecoderWorker.js`;
    // let workerPath = './Wor'
    const worker = Potree.workerPool.getWorker(workerPath);

    worker.onmessage = function (e) {
      const data = e.data;
      const buffers = data.attributeBuffers;
      const tightBoundingBox = new THREE.Box3(
        new THREE.Vector3().fromArray(data.tightBoundingBox.min),
        new THREE.Vector3().fromArray(data.tightBoundingBox.max),
      );

      Potree.workerPool.returnWorker(workerPath, worker);

      const geometry = new THREE.BufferGeometry();

      for (const property in buffers) {
        const buffer = buffers[property].buffer;

        if (parseInt(property) === PointAttributeNames.POSITION_CARTESIAN) {
          geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer), 3));
        } else if (parseInt(property) === PointAttributeNames.COLOR_PACKED) {
          geometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(buffer), 4, true));
        } else if (parseInt(property) === PointAttributeNames.INTENSITY) {
          geometry.addAttribute('intensity', new THREE.BufferAttribute(new Float32Array(buffer), 1));
        } else if (parseInt(property) === PointAttributeNames.CLASSIFICATION) {
          geometry.addAttribute('classification', new THREE.BufferAttribute(new Uint8Array(buffer), 1));
        } else if (parseInt(property) === PointAttributeNames.RETURN_NUMBER) {
          geometry.addAttribute('returnNumber', new THREE.BufferAttribute(new Uint8Array(buffer), 1));
        } else if (parseInt(property) === PointAttributeNames.NUMBER_OF_RETURNS) {
          geometry.addAttribute('numberOfReturns', new THREE.BufferAttribute(new Uint8Array(buffer), 1));
        } else if (parseInt(property) === PointAttributeNames.SOURCE_ID) {
          geometry.addAttribute('pointSourceID', new THREE.BufferAttribute(new Uint16Array(buffer), 1));
        } else if (parseInt(property) === PointAttributeNames.NORMAL_SPHEREMAPPED) {
          geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(buffer), 3));
        } else if (parseInt(property) === PointAttributeNames.NORMAL_OCT16) {
          geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(buffer), 3));
        } else if (parseInt(property) === PointAttributeNames.NORMAL) {
          geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(buffer), 3));
        } else if (parseInt(property) === PointAttributeNames.INDICES) {
          const bufferAttribute = new THREE.BufferAttribute(new Uint8Array(buffer), 4);
          bufferAttribute.normalized = true;
          geometry.addAttribute('indices', bufferAttribute);
        } else if (parseInt(property) === PointAttributeNames.SPACING) {
          const bufferAttribute = new THREE.BufferAttribute(new Float32Array(buffer), 1);
          geometry.addAttribute('spacing', bufferAttribute);
        }
      }


      tightBoundingBox.max.sub(tightBoundingBox.min);
      tightBoundingBox.min.set(0, 0, 0);

      const numPoints = e.data.buffer.byteLength / pointAttributes.byteSize;

      node.numPoints = numPoints;
      node.geometry = geometry;
      node.mean = new THREE.Vector3(...data.mean);
      node.tightBoundingBox = tightBoundingBox;
      node.loaded = true;
      node.loading = false;
      node.estimatedSpacing = data.estimatedSpacing;
      Potree.numNodesLoading--;
    };

    const message = {
      buffer,
      pointAttributes,
      version: this.version.version,
      min: [node.boundingBox.min.x, node.boundingBox.min.y, node.boundingBox.min.z],
      offset: [node.pcoGeometry.offset.x, node.pcoGeometry.offset.y, node.pcoGeometry.offset.z],
      scale: this.scale,
      spacing: node.spacing,
      hasChildren: node.hasChildren,
      name: node.name,
    };
    worker.postMessage(message, [message.buffer]);
  }
}
