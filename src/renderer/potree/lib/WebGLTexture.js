import * as THREE from 'three';

import paramThreeToGL from './paramThreeToGL';

class WebGLTexture {
  constructor(gl, texture) {
    this.gl = gl;

    this.texture = texture;
    this.id = gl.createTexture();

    this.target = gl.TEXTURE_2D;
    this.version = -1;

    this.update(texture);
  }

  update() {
    if (!this.texture.image) {
      this.version = this.texture.version;

      return;
    }

    const gl = this.gl;
    const texture = this.texture;

    if (this.version === texture.version) {
      return;
    }

    this.target = gl.TEXTURE_2D;

    gl.bindTexture(this.target, this.id);

    const level = 0;
    const internalFormat = paramThreeToGL(gl, texture.format);
    const width = texture.image.width;
    const height = texture.image.height;
    const border = 0;
    const srcFormat = internalFormat;
    const srcType = paramThreeToGL(gl, texture.type);
    let data;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);

    if (texture instanceof THREE.DataTexture) {
      data = texture.image.data;

      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, paramThreeToGL(gl, texture.magFilter));
      gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, paramThreeToGL(gl, texture.minFilter));

      gl.texImage2D(this.target, level, internalFormat,
        width, height, border, srcFormat, srcType,
        data);
    } else if (texture instanceof THREE.CanvasTexture) {
      data = texture.image;

      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, paramThreeToGL(gl, texture.wrapS));
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, paramThreeToGL(gl, texture.wrapT));

      gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, paramThreeToGL(gl, texture.magFilter));
      gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, paramThreeToGL(gl, texture.minFilter));

      gl.texImage2D(this.target, level, internalFormat,
        internalFormat, srcType, data);
    }

    gl.bindTexture(this.target, null);

    this.version = texture.version;
  }
}

export default WebGLTexture;
