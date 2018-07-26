/**
 * @author mschuetz / http://mschuetz.at
 *
 * adapted from THREE.OrbitControls by
 *
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 *
 *
 *
 */


import { MOUSE } from '../defines.js';
import { Utils } from '../utils.js';
import { EventDispatcher } from '../EventDispatcher.js';


export class OrbitControls extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;
    this.renderer = viewer.renderer;

    this.scene = null;
    this.sceneControls = new THREE.Scene();

    this.rotationSpeed = 5;

    this.fadeFactor = 10;
    this.yawDelta = 0;
    this.pitchDelta = 0;
    this.panDelta = new THREE.Vector2(0, 0);
    this.radiusDelta = 0;

    this.tweens = [];

    const drag = (e) => {
      if (e.drag.object !== null) {
        return;
      }

      if (e.drag.startHandled === undefined) {
        e.drag.startHandled = true;

        this.dispatchEvent({ type: 'start' });
      }

      const ndrag = {
        x: e.drag.lastDrag.x / this.renderer.domElement.clientWidth,
        y: e.drag.lastDrag.y / this.renderer.domElement.clientHeight,
      };

      if (e.drag.mouse === MOUSE.LEFT) {
        this.yawDelta += ndrag.x * this.rotationSpeed;
        this.pitchDelta += ndrag.y * this.rotationSpeed;

        this.stopTweens();
      } else if (e.drag.mouse === MOUSE.RIGHT) {
        this.panDelta.x += ndrag.x;
        this.panDelta.y += ndrag.y;

        this.stopTweens();
      }
    };

    const drop = (e) => {
      this.dispatchEvent({ type: 'end' });
    };

    const scroll = (e) => {
      const resolvedRadius = this.scene.view.radius + this.radiusDelta;

      this.radiusDelta += -e.delta * resolvedRadius * 0.1;

      this.stopTweens();
    };

    const dblclick = (e) => {
      this.zoomToLocation(e.mouse);
    };

    let previousTouch = null;
    const touchStart = (e) => {
      previousTouch = e;
    };

    const touchEnd = (e) => {
      previousTouch = e;
    };

    const touchMove = (e) => {
      if (e.touches.length === 2 && previousTouch.touches.length === 2) {
        const prev = previousTouch;
        const curr = e;

        const prevDX = prev.touches[0].pageX - prev.touches[1].pageX;
        const prevDY = prev.touches[0].pageY - prev.touches[1].pageY;
        const prevDist = Math.sqrt(prevDX * prevDX + prevDY * prevDY);

        const currDX = curr.touches[0].pageX - curr.touches[1].pageX;
        const currDY = curr.touches[0].pageY - curr.touches[1].pageY;
        const currDist = Math.sqrt(currDX * currDX + currDY * currDY);

        const delta = currDist / prevDist;
        const resolvedRadius = this.scene.view.radius + this.radiusDelta;
        const newRadius = resolvedRadius / delta;
        this.radiusDelta = newRadius - resolvedRadius;

        this.stopTweens();
      } else if (e.touches.length === 3 && previousTouch.touches.length === 3) {
        const prev = previousTouch;
        const curr = e;

        const prevMeanX = (prev.touches[0].pageX + prev.touches[1].pageX + prev.touches[2].pageX) / 3;
        const prevMeanY = (prev.touches[0].pageY + prev.touches[1].pageY + prev.touches[2].pageY) / 3;

        const currMeanX = (curr.touches[0].pageX + curr.touches[1].pageX + curr.touches[2].pageX) / 3;
        const currMeanY = (curr.touches[0].pageY + curr.touches[1].pageY + curr.touches[2].pageY) / 3;

        const delta = {
          x: (currMeanX - prevMeanX) / this.renderer.domElement.clientWidth,
          y: (currMeanY - prevMeanY) / this.renderer.domElement.clientHeight,
        };

        this.panDelta.x += delta.x;
        this.panDelta.y += delta.y;

        this.stopTweens();
      }

      previousTouch = e;
    };

    this.addEventListener('touchstart', touchStart);
    this.addEventListener('touchend', touchEnd);
    this.addEventListener('touchmove', touchMove);
    this.addEventListener('drag', drag);
    this.addEventListener('drop', drop);
    this.addEventListener('mousewheel', scroll);
    this.addEventListener('dblclick', dblclick);
  }

  setScene(scene) {
    this.scene = scene;
  }

  stop() {
    this.yawDelta = 0;
    this.pitchDelta = 0;
    this.radiusDelta = 0;
    this.panDelta.set(0, 0);
  }

  zoomToLocation(mouse) {
    const camera = this.scene.getActiveCamera();

    const I = Utils.getMousePointCloudIntersection(
      mouse,
      camera,
      this.viewer,
      this.scene.pointclouds,
      { pickClipped: true });

    if (I === null) {
      return;
    }

    let targetRadius = 0;
    {
      const minimumJumpDistance = 0.2;

      const domElement = this.renderer.domElement;
      const ray = Utils.mouseToRay(mouse, camera, domElement.clientWidth, domElement.clientHeight);

      const nodes = I.pointcloud.nodesOnRay(I.pointcloud.visibleNodes, ray);
      const lastNode = nodes[nodes.length - 1];
      const radius = lastNode.getBoundingSphere(new THREE.Sphere()).radius;
      targetRadius = Math.min(this.scene.view.radius, radius);
      targetRadius = Math.max(minimumJumpDistance, targetRadius);
    }

    const d = this.scene.view.direction.multiplyScalar(-1);
    const cameraTargetPosition = new THREE.Vector3().addVectors(I.location, d.multiplyScalar(targetRadius));
    // TODO Unused: let controlsTargetPosition = I.location;

    const animationDuration = 600;
    const easing = TWEEN.Easing.Quartic.Out;

    { // animate
      const value = { x: 0 };
      const tween = new TWEEN.Tween(value).to({ x: 1 }, animationDuration);
      tween.easing(easing);
      this.tweens.push(tween);

      const startPos = this.scene.view.position.clone();
      const targetPos = cameraTargetPosition.clone();
      const startRadius = this.scene.view.radius;
      const targetRadius = cameraTargetPosition.distanceTo(I.location);

      tween.onUpdate(() => {
        const t = value.x;
        this.scene.view.position.x = (1 - t) * startPos.x + t * targetPos.x;
        this.scene.view.position.y = (1 - t) * startPos.y + t * targetPos.y;
        this.scene.view.position.z = (1 - t) * startPos.z + t * targetPos.z;

        this.scene.view.radius = (1 - t) * startRadius + t * targetRadius;
        this.viewer.setMoveSpeed(this.scene.view.radius / 2.5);
      });

      tween.onComplete(() => {
        this.tweens = this.tweens.filter(e => e !== tween);
      });

      tween.start();
    }
  }

  stopTweens() {
    this.tweens.forEach(e => e.stop());
    this.tweens = [];
  }

  update(delta) {
    const view = this.scene.view;

    { // apply rotation
      const progression = Math.min(1, this.fadeFactor * delta);

      let yaw = view.yaw;
      let pitch = view.pitch;
      const pivot = view.getPivot();

      yaw -= progression * this.yawDelta;
      pitch -= progression * this.pitchDelta;

      view.yaw = yaw;
      view.pitch = pitch;

      const V = this.scene.view.direction.multiplyScalar(-view.radius);
      const position = new THREE.Vector3().addVectors(pivot, V);

      view.position.copy(position);
    }

    { // apply pan
      const progression = Math.min(1, this.fadeFactor * delta);
      const panDistance = progression * view.radius * 3;

      const px = -this.panDelta.x * panDistance;
      const py = this.panDelta.y * panDistance;

      view.pan(px, py);
    }

    { // apply zoom
      const progression = Math.min(1, this.fadeFactor * delta);

      // let radius = view.radius + progression * this.radiusDelta * view.radius * 0.1;
      const radius = view.radius + progression * this.radiusDelta;

      const V = view.direction.multiplyScalar(-radius);
      const position = new THREE.Vector3().addVectors(view.getPivot(), V);
      view.radius = radius;

      view.position.copy(position);
    }

    {
      const speed = view.radius / 2.5;
      this.viewer.setMoveSpeed(speed);
    }

    { // decelerate over time
      const progression = Math.min(1, this.fadeFactor * delta);
      const attenuation = Math.max(0, 1 - this.fadeFactor * delta);

      this.yawDelta *= attenuation;
      this.pitchDelta *= attenuation;
      this.panDelta.multiplyScalar(attenuation);
      // this.radiusDelta *= attenuation;
      this.radiusDelta -= progression * this.radiusDelta;
    }
  }
}
