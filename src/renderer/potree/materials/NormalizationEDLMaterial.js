import * as THREE from 'three';

import { Shaders } from './shaders.js';

export default class NormalizationEDLMaterial extends THREE.RawShaderMaterial {
  constructor(parameters = {}) { // eslint-disable-line
    super();

    const uniforms = {
      screenWidth: { type: 'f', 	value: 0 },
      screenHeight: { type: 'f', 	value: 0 },
      edlStrength: { type: 'f', 	value: 1.0 },
      radius: { type: 'f', 	value: 1.0 },
      neighbours:	{ type: '2fv', 	value: [] },
      uEDLMap:	{ type: 't', value: null },
      uDepthMap:	{ type: 't', value: null },
      uWeightMap:	{ type: 't', value: null },
    };

    this.setValues({
      uniforms,
      vertexShader: this.getDefines() + Shaders['normalize.vs'],
      fragmentShader: this.getDefines() + Shaders['normalize_and_edl.fs'],
    });

    this.neighbourCount = 8;
  }

  getDefines() {
    let defines = '';

    defines += `#define NEIGHBOUR_COUNT ${this.neighbourCount}\n`;

    return defines;
  }

  updateShaderSource() {
    const vs = this.getDefines() + Shaders['normalize.vs'];
    const fs = this.getDefines() + Shaders['normalize_and_edl.fs'];

    this.setValues({
      vertexShader: vs,
      fragmentShader: fs,
    });

    this.uniforms.neighbours.value = this.neighbours;

    this.needsUpdate = true;
  }

  get neighbourCount() {
    return this._neighbourCount;
  }

  set neighbourCount(value) {
    if (this._neighbourCount !== value) {
      this._neighbourCount = value;
      this.neighbours = new Float32Array(this._neighbourCount * 2);
      for (let c = 0; c < this._neighbourCount; c++) {
        this.neighbours[2 * c + 0] = Math.cos(2 * c * Math.PI / this._neighbourCount);
        this.neighbours[2 * c + 1] = Math.sin(2 * c * Math.PI / this._neighbourCount);
      }

      this.updateShaderSource();
    }
  }
}

