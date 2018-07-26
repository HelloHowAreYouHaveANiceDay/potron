
// import Potree from '../Potree';
import { Version } from '../Version.js';
import { PointAttribute } from '../loader/PointAttributes.js';
// import { InterleavedBuffer } from '../InterleavedBuffer.js';
// import { toInterleavedBufferAttribute } from '../utils/toInterleavedBufferAttribute.js';


/* global onmessage:true postMessage:false */
/* exported onmessage */
// http://jsperf.com/uint8array-vs-dataview3/3
function CustomView(buffer) {
  this.buffer = buffer;
  this.u8 = new Uint8Array(buffer);

  const tmp = new ArrayBuffer(4);
  const tmpf = new Float32Array(tmp);
  const tmpu8 = new Uint8Array(tmp);

  this.getUint32 = function (i) {
    return (this.u8[i + 3] << 24) | (this.u8[i + 2] << 16) | (this.u8[i + 1] << 8) | this.u8[i];
  };

  this.getUint16 = function (i) {
    return (this.u8[i + 1] << 8) | this.u8[i];
  };

  this.getFloat32 = function (i) {
    tmpu8[0] = this.u8[i + 0];
    tmpu8[1] = this.u8[i + 1];
    tmpu8[2] = this.u8[i + 2];
    tmpu8[3] = this.u8[i + 3];

    return tmpf[0];
  };

  this.getUint8 = function (i) {
    return this.u8[i];
  };
}

// Potree = {};

onmessage = function (event) {
  performance.mark('binary-decoder-start');

  const buffer = event.data.buffer;
  const pointAttributes = event.data.pointAttributes;
  const numPoints = buffer.byteLength / pointAttributes.byteSize;
  const cv = new CustomView(buffer);
  const version = new Version(event.data.version);
  const nodeOffset = event.data.offset;
  const scale = event.data.scale;
  // const spacing = event.data.spacing;
  // const hasChildren = event.data.hasChildren;
  // const name = event.data.name;

  const tightBoxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const tightBoxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  const mean = [0, 0, 0];


  const attributeBuffers = {};
  let inOffset = 0;
  for (const pointAttribute of pointAttributes.attributes) {
    if (pointAttribute.name === PointAttribute.POSITION_CARTESIAN.name) {
      const buff = new ArrayBuffer(numPoints * 4 * 3);
      const positions = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        let x;
        let y;
        let z;

        if (version.newerThan('1.3')) {
          x = (cv.getUint32(inOffset + j * pointAttributes.byteSize + 0, true) * scale);
          y = (cv.getUint32(inOffset + j * pointAttributes.byteSize + 4, true) * scale);
          z = (cv.getUint32(inOffset + j * pointAttributes.byteSize + 8, true) * scale);
        } else {
          x = cv.getFloat32(j * pointAttributes.byteSize + 0, true) + nodeOffset[0];
          y = cv.getFloat32(j * pointAttributes.byteSize + 4, true) + nodeOffset[1];
          z = cv.getFloat32(j * pointAttributes.byteSize + 8, true) + nodeOffset[2];
        }

        positions[3 * j + 0] = x;
        positions[3 * j + 1] = y;
        positions[3 * j + 2] = z;

        mean[0] += x / numPoints;
        mean[1] += y / numPoints;
        mean[2] += z / numPoints;

        tightBoxMin[0] = Math.min(tightBoxMin[0], x);
        tightBoxMin[1] = Math.min(tightBoxMin[1], y);
        tightBoxMin[2] = Math.min(tightBoxMin[2], z);

        tightBoxMax[0] = Math.max(tightBoxMax[0], x);
        tightBoxMax[1] = Math.max(tightBoxMax[1], y);
        tightBoxMax[2] = Math.max(tightBoxMax[2], z);
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.COLOR_PACKED.name) {
      const buff = new ArrayBuffer(numPoints * 4);
      const colors = new Uint8Array(buff);

      for (let j = 0; j < numPoints; j++) {
        colors[4 * j + 0] = cv.getUint8(inOffset + j * pointAttributes.byteSize + 0);
        colors[4 * j + 1] = cv.getUint8(inOffset + j * pointAttributes.byteSize + 1);
        colors[4 * j + 2] = cv.getUint8(inOffset + j * pointAttributes.byteSize + 2);
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.INTENSITY.name) {
      const buff = new ArrayBuffer(numPoints * 4);
      const intensities = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const intensity = cv.getUint16(inOffset + j * pointAttributes.byteSize, true);
        intensities[j] = intensity;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.CLASSIFICATION.name) {
      const buff = new ArrayBuffer(numPoints);
      const classifications = new Uint8Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const classification = cv.getUint8(inOffset + j * pointAttributes.byteSize);
        classifications[j] = classification;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.RETURN_NUMBER.name) {
      const buff = new ArrayBuffer(numPoints);
      const returnNumbers = new Uint8Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const returnNumber = cv.getUint8(inOffset + j * pointAttributes.byteSize);
        returnNumbers[j] = returnNumber;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.NUMBER_OF_RETURNS.name) {
      const buff = new ArrayBuffer(numPoints);
      const numberOfReturns = new Uint8Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const numberOfReturn = cv.getUint8(inOffset + j * pointAttributes.byteSize);
        numberOfReturns[j] = numberOfReturn;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.SOURCE_ID.name) {
      const buff = new ArrayBuffer(numPoints * 2);
      const sourceIDs = new Uint16Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const sourceID = cv.getUint16(inOffset + j * pointAttributes.byteSize);
        sourceIDs[j] = sourceID;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.NORMAL_SPHEREMAPPED.name) {
      const buff = new ArrayBuffer(numPoints * 4 * 3);
      const normals = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const bx = cv.getUint8(inOffset + j * pointAttributes.byteSize + 0);
        const by = cv.getUint8(inOffset + j * pointAttributes.byteSize + 1);

        const ex = bx / 255;
        const ey = by / 255;

        let nx = ex * 2 - 1;
        let ny = ey * 2 - 1;
        let nz = 1;
        const nw = -1;

        const l = (nx * (-nx)) + (ny * (-ny)) + (nz * (-nw));
        nz = l;
        nx *= Math.sqrt(l);
        ny *= Math.sqrt(l);

        nx *= 2;
        ny *= 2;
        nz = nz * 2 - 1;

        normals[3 * j + 0] = nx;
        normals[3 * j + 1] = ny;
        normals[3 * j + 2] = nz;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.NORMAL_OCT16.name) {
      const buff = new ArrayBuffer(numPoints * 4 * 3);
      const normals = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const bx = cv.getUint8(inOffset + j * pointAttributes.byteSize + 0);
        const by = cv.getUint8(inOffset + j * pointAttributes.byteSize + 1);

        const u = (bx / 255) * 2 - 1;
        const v = (by / 255) * 2 - 1;

        let z = 1 - Math.abs(u) - Math.abs(v);

        let x = 0;
        let y = 0;
        if (z >= 0) {
          x = u;
          y = v;
        } else {
          x = -(v / Math.sign(v) - 1) / Math.sign(u);
          y = -(u / Math.sign(u) - 1) / Math.sign(v);
        }

        const length = Math.sqrt(x * x + y * y + z * z);
        x /= length;
        y /= length;
        z /= length;

        normals[3 * j + 0] = x;
        normals[3 * j + 1] = y;
        normals[3 * j + 2] = z;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    } else if (pointAttribute.name === PointAttribute.NORMAL.name) {
      const buff = new ArrayBuffer(numPoints * 4 * 3);
      const normals = new Float32Array(buff);

      for (let j = 0; j < numPoints; j++) {
        const x = cv.getFloat32(inOffset + j * pointAttributes.byteSize + 0, true);
        const y = cv.getFloat32(inOffset + j * pointAttributes.byteSize + 4, true);
        const z = cv.getFloat32(inOffset + j * pointAttributes.byteSize + 8, true);

        normals[3 * j + 0] = x;
        normals[3 * j + 1] = y;
        normals[3 * j + 2] = z;
      }

      attributeBuffers[pointAttribute.name] = { buffer: buff, attribute: pointAttribute };
    }

    inOffset += pointAttribute.byteSize;
  }

  // let debugNodes = ["r026", "r0226","r02274"];
  // if(debugNodes.includes(name)){
  if (false) {
    console.log('estimate spacing!');


    const sparseGrid = new Map();
    const gridSize = 16;

    const tightBoxSize = tightBoxMax.map((a, i) => a - tightBoxMin[i]);
    const cubeLength = Math.max(...tightBoxSize);
    const cube = {
      min: tightBoxMin,
      max: tightBoxMin.map(v => v + cubeLength),
    };

    const positions = new Float32Array(attributeBuffers[PointAttribute.POSITION_CARTESIAN.name].buffer);
    for (let i = 0; i < numPoints; i++) {
      const x = positions[3 * i + 0];
      const y = positions[3 * i + 1];
      const z = positions[3 * i + 2];

      let ix = Math.max(0, Math.min(gridSize * (x - cube.min[0]) / cubeLength, gridSize - 1));
      let iy = Math.max(0, Math.min(gridSize * (y - cube.min[1]) / cubeLength, gridSize - 1));
      let iz = Math.max(0, Math.min(gridSize * (z - cube.min[2]) / cubeLength, gridSize - 1));

      ix = Math.floor(ix);
      iy = Math.floor(iy);
      iz = Math.floor(iz);

      const cellIndex = ix | (iy << 8) | (iz << 16);

      if (!sparseGrid.has(cellIndex)) {
        sparseGrid.set(cellIndex, []);
      }

      sparseGrid.get(cellIndex).push(i);
    }

    const kNearest = (pointIndex, candidates, numNearest) => {
      const x = positions[3 * pointIndex + 0];
      const y = positions[3 * pointIndex + 1];
      const z = positions[3 * pointIndex + 2];

      const candidateDistances = [];

      for (const candidateIndex of candidates) {
        if (candidateIndex === pointIndex) {
          continue;
        }

        const cx = positions[3 * candidateIndex + 0];
        const cy = positions[3 * candidateIndex + 1];
        const cz = positions[3 * candidateIndex + 2];

        const squaredDistance = (cx - x) ** 2 + (cy - y) ** 2 + (cz - z) ** 2;

        candidateDistances.push({ candidateInde: candidateIndex, squaredDistance });
      }

      candidateDistances.sort((a, b) => a.squaredDistance - b.squaredDistance);
      const nearest = candidateDistances.slice(0, numNearest);

      return nearest;
    };

    const meansBuffer = new ArrayBuffer(numPoints * 4);
    const means = new Float32Array(meansBuffer);

    for (const [key, value] of sparseGrid) {
      for (const pointIndex of value) {
        if (value.length === 1) {
          means[pointIndex] = 0;
          continue;
        }

        const [ix, iy, iz] = [(key & 255), ((key >> 8) & 255), ((key >> 16) & 255)];

        // let candidates = value;
        const candidates = [];
        for (const i of [-1, 0, 1]) {
          for (const j of [-1, 0, 1]) {
            for (const k of [-1, 0, 1]) {
              const cellIndex = (ix + i) | ((iy + j) << 8) | ((iz + k) << 16);

              if (sparseGrid.has(cellIndex)) {
                candidates.push(...sparseGrid.get(cellIndex));
              }
            }
          }
        }


        const nearestNeighbors = kNearest(pointIndex, candidates, 10);

        // let sum = 0;
        // for (const neighbor of nearestNeighbors) {
        //   sum += Math.sqrt(neighbor.squaredDistance);
        // }

        // let mean = sum / nearestNeighbors.length;
        const mean = Math.sqrt(Math.max(...nearestNeighbors.map(n => n.squaredDistance)));

        if (Number.isNaN(mean)) {
          debugger;
        }


        means[pointIndex] = mean;
      }
    }


    // const maxMean = Math.max(...means);
    // const minMean = Math.min(...means);

    // let colors = new Uint8Array(attributeBuffers[PointAttribute.COLOR_PACKED.name].buffer);
    // for(let i = 0; i < numPoints; i++){
    //	let v = means[i] / 0.05;

    //	colors[4 * i + 0] = 255 * v;
    //	colors[4 * i + 1] = 255 * v;
    //	colors[4 * i + 2] = 255 * v;
    // }

    attributeBuffers[PointAttribute.SPACING.name] = { buffer: meansBuffer, attribute: PointAttribute.SPACING };
  }


  { // add indices
    const buff = new ArrayBuffer(numPoints * 4);
    const indices = new Uint32Array(buff);

    for (let i = 0; i < numPoints; i++) {
      indices[i] = i;
    }

    attributeBuffers[PointAttribute.INDICES.name] = { buffer: buff, attribute: PointAttribute.INDICES };
  }

  performance.mark('binary-decoder-end');

  // { // print timings
  //	//performance.measure("spacing", "spacing-start", "spacing-end");
  //	performance.measure("binary-decoder", "binary-decoder-start", "binary-decoder-end");
  //	let measure = performance.getEntriesByType("measure")[0];
  //	let dpp = 1000 * measure.duration / numPoints;
  //	let debugMessage = `${measure.duration.toFixed(3)} ms, ${numPoints} points, ${dpp.toFixed(3)} µs / point`;
  //	console.log(debugMessage);
  // }

  performance.clearMarks();
  performance.clearMeasures();

  const message = {
    buffer,
    mean,
    attributeBuffers,
    tightBoundingBox: { min: tightBoxMin, max: tightBoxMax },
    // estimatedSpacing: estimatedSpacing,
  };

  const transferables = [];
  /* eslint-disable */
  for (const property in message.attributeBuffers) {
    transferables.push(message.attributeBuffers[property].buffer);
  }
  transferables.push(buffer);
  /* eslint-enable */

  postMessage(message, transferables);
};
