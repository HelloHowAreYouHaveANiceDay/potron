/**
 * @author chrisl / Geodan
 *
 * adapted from Potree.FirstPersonControls by
 *
 * @author mschuetz / http://mschuetz.at
 *
 * and THREE.DeviceOrientationControls  by
 *
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 *
 *
 */
import * as THREE from 'three';

import { EventDispatcher } from '../EventDispatcher.js';

export default class DeviceOrientationControls extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;
    this.renderer = viewer.renderer;

    this.scene = null;
    this.sceneControls = new THREE.Scene();

    this.screenOrientation = window.orientation || 0;

    const deviceOrientationChange = (e) => {
      this.deviceOrientation = e;
    };

    const screenOrientationChange = (e) => { // eslint-disable-line
      this.screenOrientation = window.orientation || 0;
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', deviceOrientationChange);
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', deviceOrientationChange);
    } else {
      console.warn('No device orientation found.');
    }
    // window.addEventListener('deviceorientation', deviceOrientationChange);
    window.addEventListener('orientationchange', screenOrientationChange);
  }

  setScene(scene) {
    this.scene = scene;
  }

  update(delta) { // eslint-disable-line
    const computeQuaternion = function (alpha, beta, gamma, orient) {
      const quaternion = new THREE.Quaternion();

      const zee = new THREE.Vector3(0, 0, 1);
      const euler = new THREE.Euler();
      const q0 = new THREE.Quaternion();

      euler.set(beta, gamma, alpha, 'ZXY');
      quaternion.setFromEuler(euler);
      quaternion.multiply(q0.setFromAxisAngle(zee, -orient));

      return quaternion;
    };

    if (typeof this.deviceOrientation !== 'undefined') {
      const alpha = this.deviceOrientation.alpha ? THREE.Math.degToRad(this.deviceOrientation.alpha) : 0;
      const beta = this.deviceOrientation.beta ? THREE.Math.degToRad(this.deviceOrientation.beta) : 0;
      const gamma = this.deviceOrientation.gamma ? THREE.Math.degToRad(this.deviceOrientation.gamma) : 0;
      const orient = this.screenOrientation ? THREE.Math.degToRad(this.screenOrientation) : 0;

      const quaternion = computeQuaternion(alpha, beta, gamma, orient);
      viewer.scene.cameraP.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w); // eslint-disable-line
    }
  }
}
