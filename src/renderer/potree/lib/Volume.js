import * as THREE from 'three';
import TextSprite from './TextSprite';

class Volume extends THREE.Object3D {
  constructor(args = {}) {
    super();

    if (this.constructor.name === 'Volume') {
      console.warn("Can't create object of class Volume directly. Use classes BoxVolume or SphereVolume instead.");
    }

    // console.log(this);
    // console.log(this.constructor);
    // console.log(this.constructor.name);

    this._clip = args.clip || false;
    this._visible = true;
    this.showVolumeLabel = true;
    this._modifiable = args.modifiable || true;

    this.label = new TextSprite('0');
    this.label.setBorderColor({ r: 0, g: 255, b: 0, a: 0.0 });
    this.label.setBackgroundColor({ r: 0, g: 255, b: 0, a: 0.0 });
    this.label.material.depthTest = false;
    this.label.material.depthWrite = false;
    this.label.material.transparent = true;
    this.label.position.y -= 0.5;
    this.add(this.label);

    this.label.updateMatrixWorld = () => {
      const volumeWorldPos = new THREE.Vector3();
      volumeWorldPos.setFromMatrixPosition(this.matrixWorld);
      this.label.position.copy(volumeWorldPos);
      this.label.updateMatrix();
      this.label.matrixWorld.copy(this.label.matrix);
      this.label.matrixWorldNeedsUpdate = false;

      for (let i = 0, l = this.label.children.length; i < l; i++) {
        this.label.children[i].updateMatrixWorld(true);
      }
    };

    { // event listeners
      this.addEventListener('select', (e) => { }); // eslint-disable-line
      this.addEventListener('deselect', (e) => { }); // eslint-disable-line
    }
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (this._visible !== value) {
      this._visible = value;

      this.dispatchEvent({ type: 'visibility_changed', object: this });
    }
  }

  getVolume() {
    console.warn('override this in subclass');
  }

  update() {

  }

  // raycast(raycaster, intersects) {

  // }

  get clip() {
    return this._clip;
  }

  set clip(value) {
    if (this._clip !== value) {
      this._clip = value;

      this.update();

      this.dispatchEvent({
        type: 'clip_changed',
        object: this,
      });
    }
  }

  get modifieable() {
    return this._modifiable;
  }

  set modifieable(value) {
    this._modifiable = value;

    this.update();
  }
}

export default Volume;
