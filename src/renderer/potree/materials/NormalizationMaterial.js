
import { Shaders } from '../../build/shaders/shaders.js';

export class NormalizationMaterial extends THREE.RawShaderMaterial {
  constructor(parameters = {}) {
    super();

    const uniforms = {
      uDepthMap:	{ type: 't', value: null },
      uWeightMap:	{ type: 't', value: null },
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

