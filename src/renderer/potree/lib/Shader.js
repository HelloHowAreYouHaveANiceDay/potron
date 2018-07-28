import * as THREE from 'three';
import attributeLocations from './AttributeLocations';

export default class Shader {
  constructor(gl, name, vsSource, fsSource) {
    this.gl = gl;
    this.name = name;
    this.vsSource = vsSource;
    this.fsSource = fsSource;

    this.cache = new Map();

    this.vs = null;
    this.fs = null;
    this.program = null;

    this.uniformLocations = {};
    this.attributeLocations = {};

    this.update(vsSource, fsSource);
  }

  update(vsSource, fsSource) {
    this.vsSource = vsSource;
    this.fsSource = fsSource;

    this.linkProgram();
  }

  compileShader(shader, source) {
    const gl = this.gl;

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      const info = gl.getShaderInfoLog(shader);
      const numberedSource = source.split('\n').map((a, i) => `${i + 1}`.padEnd(5) + a).join('\n');
      throw `could not compile shader ${this.name}: ${info}, \n${numberedSource}`;
    }
  }

  linkProgram() {
    const gl = this.gl;

    this.uniformLocations = {};
    this.attributeLocations = {};

    gl.useProgram(null);

    const cached1 = this.cache.get(`${this.vsSource}, ${this.fsSource}`);
    if (cached1) {
      this.program = cached1.program;
      this.vs = cached1.vs;
      this.fs = cached1.fs;
      this.attributeLocations = cached1.attributeLocations;
      this.uniformLocations = cached1.uniformLocations;

      return;
    }

    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();

    for (const name of Object.keys(attributeLocations)) {
      const location = attributeLocations[name];
      gl.bindAttribLocation(this.program, location, name);
    }

    this.compileShader(this.vs, this.vsSource);
    this.compileShader(this.fs, this.fsSource);

    const program = this.program;

    gl.attachShader(program, this.vs);
    gl.attachShader(program, this.fs);

    gl.linkProgram(program);

    gl.detachShader(program, this.vs);
    gl.detachShader(program, this.fs);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      const info = gl.getProgramInfoLog(program);
      throw `could not link program ${this.name}: ${info}`;
    }

    { // attribute locations
      const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

      for (let i = 0; i < numAttributes; i++) {
        const attribute = gl.getActiveAttrib(program, i);

        const location = gl.getAttribLocation(program, attribute.name);

        this.attributeLocations[attribute.name] = location;
      }
    }

    { // uniform locations
      const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

      for (let i = 0; i < numUniforms; i++) {
        const uniform = gl.getActiveUniform(program, i);

        const location = gl.getUniformLocation(program, uniform.name);

        this.uniformLocations[uniform.name] = location;
      }
    }

    const cached = {
      program: this.program,
      vs: this.vs,
      fs: this.fs,
      attributeLocations: this.attributeLocations,
      uniformLocations: this.uniformLocations,
    };

    this.cache.set(`${this.vsSource}, ${this.fsSource}`, cached);
  }

  setUniformMatrix4(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    const tmp = new Float32Array(value.elements);
    gl.uniformMatrix4fv(location, false, tmp);
  }

  setUniform1f(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform1f(location, value);
  }

  setUniformBoolean(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform1i(location, value);
  }

  setUniformTexture(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform1i(location, value);
  }

  setUniform2f(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform2f(location, value[0], value[1]);
  }

  setUniform3f(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform3f(location, value[0], value[1], value[2]);
  }

  setUniform(name, value) {
    if (value.constructor === THREE.Matrix4) {
      this.setUniformMatrix4(name, value);
    } else if (typeof value === 'number') {
      this.setUniform1f(name, value);
    } else if (typeof value === 'boolean') {
      this.setUniformBoolean(name, value);
    } else if (value instanceof WebGLTexture) {
      this.setUniformTexture(name, value);
    } else if (value instanceof Array) {
      if (value.length === 2) {
        this.setUniform2f(name, value);
      } else if (value.length === 3) {
        this.setUniform3f(name, value);
      }
    } else {
      console.error('unhandled uniform type: ', name, value);
    }
  }


  setUniform1i(name, value) {
    const gl = this.gl;
    const location = this.uniformLocations[name];

    if (location == null) {
      return;
    }

    gl.uniform1i(location, value);
  }
}
