import * as THREE from 'three';

import Shaders from './Shaders';

export default class NormalizationMaterial extends THREE.RawShaderMaterial {
  constructor() {
    super();

    const uniforms = {
      uDepthMap: { type: 't', value: null },
      uWeightMap: { type: 't', value: null },
    };

    this.setValues({
      uniforms,
      vertexShader: this.getDefines() + Shaders['normalize.vs'],
      fragmentShader: this.getDefines() + Shaders['normalize.fs'],
    });
  }

  getDefines() {
    const defines = '';

    return defines;
  }

  updateShaderSource() {
    const vs = this.getDefines() + Shaders['normalize.vs'];
    const fs = this.getDefines() + Shaders['normalize.fs'];

    this.setValues({
      vertexShader: vs,
      fragmentShader: fs,
    });

    this.needsUpdate = true;
  }
}
