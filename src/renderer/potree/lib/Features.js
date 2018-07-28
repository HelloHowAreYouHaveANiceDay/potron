const Features = (function features() {
  const ftCanvas = document.createElement('canvas');
  const gl = ftCanvas.getContext('webgl') || ftCanvas.getContext('experimental-webgl');
  if (gl === null) { return null; }

  // -- code taken from THREE.WebGLRenderer --
  const _vertexShaderPrecisionHighpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
  const _vertexShaderPrecisionMediumpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
  // Unused: let _vertexShaderPrecisionLowpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT);

  const _fragmentShaderPrecisionHighpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const _fragmentShaderPrecisionMediumpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  // Unused: let _fragmentShaderPrecisionLowpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT);

  const highpAvailable = _vertexShaderPrecisionHighpFloat.precision > 0 && _fragmentShaderPrecisionHighpFloat.precision > 0;
  const mediumpAvailable = _vertexShaderPrecisionMediumpFloat.precision > 0 && _fragmentShaderPrecisionMediumpFloat.precision > 0;
  // -----------------------------------------

  let precision;
  if (highpAvailable) {
    precision = 'highp';
  } else if (mediumpAvailable) {
    precision = 'mediump';
  } else {
    precision = 'lowp';
  }

  return {
    SHADER_INTERPOLATION: {
      isSupported() {
        let supported = true;

        supported = supported && gl.getExtension('EXT_frag_depth');
        supported = supported && gl.getParameter(gl.MAX_VARYING_VECTORS) >= 8;

        return supported;
      },
    },
    SHADER_SPLATS: {
      isSupported() {
        let supported = true;

        supported = supported && gl.getExtension('EXT_frag_depth');
        supported = supported && gl.getExtension('OES_texture_float');
        supported = supported && gl.getParameter(gl.MAX_VARYING_VECTORS) >= 8;

        return supported;
      },

    },
    SHADER_EDL: {
      isSupported() {
        let supported = true;

        // supported = supported && gl.getExtension('EXT_frag_depth');
        supported = supported && gl.getExtension('OES_texture_float');
        supported = supported && gl.getParameter(gl.MAX_VARYING_VECTORS) >= 8;

        return supported;
      },

    },
    precision,
  };
}());

export default Features;
