import * as THREE from 'three';

import edlvs from './shaders/edl.vs';
import edlfs from './shaders/edl.fs';

//
// Algorithm by Christian Boucheny
// shader code taken and adapted from CloudCompare
//
// see
// https://github.com/cloudcompare/trunk/tree/master/plugins/qEDL/shaders/EDL
// http://www.kitware.com/source/home/post/9
// https://tel.archives-ouvertes.fr/tel-00438464/document p. 115+ (french)

export default class EyeDomeLightingMaterial extends THREE.ShaderMaterial {
  constructor() {
    super();

    const uniforms = {
      screenWidth: { type: 'f', 	value: 0 },
      screenHeight: { type: 'f', 	value: 0 },
      edlStrength: { type: 'f', 	value: 1.0 },
      radius: { type: 'f', 	value: 1.0 },
      neighbours:	{ type: '2fv', 	value: [] },
      depthMap: { type: 't', 	value: null },
      // colorMap: 		{ type: 't', 	value: null },
      uRegularColor:	{ type: 't', 	value: null },
      uRegularDepth:	{ type: 't', 	value: null },
      uEDLColor:	{ type: 't', 	value: null },
      uEDLDepth:	{ type: 't', 	value: null },
      opacity:	{ type: 'f',	value: 1.0 },
    };

    this.setValues({
      uniforms,
      // vertexShader: this.getDefines() + Shaders['edl.vs'],
      // fragmentShader: this.getDefines() + Shaders['edl.fs'],
      vertexShader: this.getDefines() + edlvs,
      fragmentShader: this.getDefines() + edlfs,
      lights: false,
    });

    this.neighbourCount = 8;
  }

  getDefines() {
    let defines = '';

    defines += `#define NEIGHBOUR_COUNT ${this.neighbourCount}\n`;

    return defines;
  }

  updateShaderSource() {
    // const vs = this.getDefines() + Shaders['edl.vs'];
    // const fs = this.getDefines() + Shaders['edl.fs'];
    const vs = this.getDefines() + edlvs;
    const fs = this.getDefines() + edlfs;

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

