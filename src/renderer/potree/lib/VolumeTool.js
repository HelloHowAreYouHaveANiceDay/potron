import * as THREE from 'three';

import EventDispatcher from './EventDispatcher';
import Utils from './Utils';
import BoxVolume from './BoxVolume';
import Volume from './Volume';

export default class VolumeTool extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;
    this.renderer = viewer.renderer;

    this.addEventListener('start_inserting_volume', () => {
      this.viewer.dispatchEvent({
        type: 'cancel_insertions',
      });
    });

    this.scene = new THREE.Scene();
    this.scene.name = 'scene_volume';

    this.viewer.inputHandler.registerInteractiveScene(this.scene);

    this.onRemove = (e) => {
      this.scene.remove(e.volume);
    };

    this.onAdd = (e) => {
      this.scene.add(e.volume);
    };

    for (const volume of viewer.scene.volumes) {
      this.onAdd({ volume });
    }

    this.viewer.inputHandler.addEventListener('delete', (e) => {
      const volumes = e.selection.filter(e => (e instanceof Volume));
      volumes.forEach(e => this.viewer.scene.removeVolume(e));
    });

    viewer.addEventListener('update', this.update.bind(this));
    viewer.addEventListener('render.pass.scene', e => this.render(e));
    viewer.addEventListener('scene_changed', this.onSceneChange.bind(this));

    viewer.scene.addEventListener('volume_added', this.onAdd);
    viewer.scene.addEventListener('volume_removed', this.onRemove);
  }

  onSceneChange(e) {
    if (e.oldScene) {
      e.oldScene.removeEventListeners('volume_added', this.onAdd);
      e.oldScene.removeEventListeners('volume_removed', this.onRemove);
    }

    e.scene.addEventListener('volume_added', this.onAdd);
    e.scene.addEventListener('volume_removed', this.onRemove);
  }

  startInsertion(args = {}) {
    let volume;
    if (args.type) {
      volume = new args.type(); // eslint-disable-line
    } else {
      volume = new BoxVolume();
    }

    volume.clip = args.clip || false;
    volume.name = args.name || 'Volume';

    this.dispatchEvent({
      type: 'start_inserting_volume',
      volume,
    });

    this.viewer.scene.addVolume(volume);
    this.scene.add(volume);

    const cancel = {
      callback: null,
    };

    const drag = (e) => {
      const camera = this.viewer.scene.getActiveCamera();

      const I = Utils.getMousePointCloudIntersection(
        e.drag.end,
        this.viewer.scene.getActiveCamera(),
        this.viewer,
        this.viewer.scene.pointclouds);

      if (I) {
        volume.position.copy(I.location);

        const wp = volume.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse);
        // let pp = new THREE.Vector4(wp.x, wp.y, wp.z).applyMatrix4(camera.projectionMatrix);
        const w = Math.abs((wp.z / 5));
        volume.scale.set(w, w, w);
      }
    };

    const drop = () => {
      volume.removeEventListener('drag', drag);
      volume.removeEventListener('drop', drop);
      cancel.callback();
    };

    cancel.callback = () => {
      volume.removeEventListener('drag', drag);
      volume.removeEventListener('drop', drop);
      this.viewer.removeEventListener('cancel_insertions', cancel.callback);
    };

    volume.addEventListener('drag', drag);
    volume.addEventListener('drop', drop);
    this.viewer.addEventListener('cancel_insertions', cancel.callback);

    this.viewer.inputHandler.startDragging(volume);

    return volume;
  }

  update() {
    if (!this.viewer.scene) {
      return;
    }

    const camera = this.viewer.scene.getActiveCamera();
    const clientWidth = this.viewer.renderer.getSize().width;
    const clientHeight = this.viewer.renderer.getSize().height;

    const volumes = this.viewer.scene.volumes;
    for (const volume of volumes) {
      const label = volume.label;

      {
        const distance = label.position.distanceTo(camera.position);
        const pr = Utils.projectedRadius(1, camera, distance, clientWidth, clientHeight);

        const scale = (70 / pr);
        label.scale.set(scale, scale, scale);
      }

      const text = `${Utils.addCommas(volume.getVolume().toFixed(3))}\u00B3`;
      label.setText(text);
    }
  }

  render(params) {
    this.viewer.renderer.render(this.scene, this.viewer.scene.getActiveCamera(), params.renderTarget);
  }
}
