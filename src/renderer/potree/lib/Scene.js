import * as THREE from 'three';

import EventDispatcher from './EventDispatcher';
import Annotation from './Annotation';
import CameraMode from './CameraMode';
import View from './View';
import Utils from './Utils';

export default class Scene extends EventDispatcher {
  constructor() {
    super();

    this.annotations = new Annotation();

    this.scene = new THREE.Scene();
    this.sceneBG = new THREE.Scene();
    this.scenePointCloud = new THREE.Scene();

    this.cameraP = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1000 * 1000);
    this.cameraO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000 * 1000);
    this.cameraBG = new THREE.Camera();
    this.cameraScreenSpace = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.cameraMode = CameraMode.PERSPECTIVE;
    this.pointclouds = [];

    this.measurements = [];
    this.profiles = [];
    this.volumes = [];
    this.polygonClipVolumes = [];

    this.fpControls = null;
    this.orbitControls = null;
    this.earthControls = null;
    this.geoControls = null;
    this.deviceControls = null;
    this.inputHandler = null;

    this.view = new View();

    this.directionalLight = null;

    this.initialize();
  }

  estimateHeightAt(position) {
    let height = null;
    let fromSpacing = Infinity;

    for (const pointcloud of this.pointclouds) {
      if (pointcloud.root.geometryNode === undefined) {
        continue;
      }

      let pHeight = null;
      let pFromSpacing = Infinity;

      const lpos = position.clone().sub(pointcloud.position);
      lpos.z = 0;
      const ray = new THREE.Ray(lpos, new THREE.Vector3(0, 0, 1));

      const stack = [pointcloud.root];
      while (stack.length > 0) {
        const node = stack.pop();
        const box = node.getBoundingBox();

        const inside = ray.intersectBox(box);

        if (!inside) {
          continue;
        }

        const h = node.geometryNode.mean.z +
          pointcloud.position.z +
          node.geometryNode.boundingBox.min.z;

        if (node.geometryNode.spacing <= pFromSpacing) {
          pHeight = h;
          pFromSpacing = node.geometryNode.spacing;
        }

        for (const index of Object.keys(node.children)) {
          const child = node.children[index];
          if (child.geometryNode) {
            stack.push(node.children[index]);
          }
        }
      }

      if (height === null || pFromSpacing < fromSpacing) {
        height = pHeight;
        fromSpacing = pFromSpacing;
      }
    }

    return height;
  }

  getBoundingBox(pointclouds = this.pointclouds) {
    const box = new THREE.Box3();

    this.scenePointCloud.updateMatrixWorld(true);
    this.referenceFrame.updateMatrixWorld(true);

    for (const pointcloud of pointclouds) {
      pointcloud.updateMatrixWorld(true);

      const pointcloudBox = pointcloud.pcoGeometry.tightBoundingBox ? pointcloud.pcoGeometry.tightBoundingBox : pointcloud.boundingBox;
      const boxWorld = Utils.computeTransformedBoundingBox(pointcloudBox, pointcloud.matrixWorld);
      box.union(boxWorld);
    }

    return box;
  }

  addPointCloud(pointcloud) {
    this.pointclouds.push(pointcloud);
    this.scenePointCloud.add(pointcloud);

    this.dispatchEvent({
      type: 'pointcloud_added',
      pointcloud,
    });
  }

  addVolume(volume) {
    this.volumes.push(volume);
    this.dispatchEvent({
      type: 'volume_added',
      scene: this,
      volume,
    });
  }

  removeVolume(volume) {
    const index = this.volumes.indexOf(volume);
    if (index > -1) {
      this.volumes.splice(index, 1);

      this.dispatchEvent({
        type: 'volume_removed',
        scene: this,
        volume,
      });
    }
  }

  addPolygonClipVolume(volume) {
    this.polygonClipVolumes.push(volume);
    this.dispatchEvent({
      type: 'polygon_clip_volume_added',
      scene: this,
      volume,
    });
  }

  removePolygonClipVolume(volume) {
    const index = this.polygonClipVolumes.indexOf(volume);
    if (index > -1) {
      this.polygonClipVolumes.splice(index, 1);
      this.dispatchEvent({
        type: 'polygon_clip_volume_removed',
        scene: this,
        volume,
      });
    }
  }

  addMeasurement(measurement) {
    measurement.lengthUnit = this.lengthUnit;
    this.measurements.push(measurement);
    this.dispatchEvent({
      type: 'measurement_added',
      scene: this,
      measurement,
    });
  }

  removeMeasurement(measurement) {
    const index = this.measurements.indexOf(measurement);
    if (index > -1) {
      this.measurements.splice(index, 1);
      this.dispatchEvent({
        type: 'measurement_removed',
        scene: this,
        measurement,
      });
    }
  }

  addProfile(profile) {
    this.profiles.push(profile);
    this.dispatchEvent({
      type: 'profile_added',
      scene: this,
      profile,
    });
  }

  removeProfile(profile) {
    const index = this.profiles.indexOf(profile);
    if (index > -1) {
      this.profiles.splice(index, 1);
      this.dispatchEvent({
        type: 'profile_removed',
        scene: this,
        profile,
      });
    }
  }

  removeAllMeasurements() {
    while (this.measurements.length > 0) {
      this.removeMeasurement(this.measurements[0]);
    }

    while (this.profiles.length > 0) {
      this.removeProfile(this.profiles[0]);
    }

    while (this.volumes.length > 0) {
      this.removeVolume(this.volumes[0]);
    }
  }

  removeAllClipVolumes() {
    const clipVolumes = this.volumes.filter(volume => volume.clip === true);
    for (const clipVolume of clipVolumes) {
      this.removeVolume(clipVolume);
    }

    while (this.polygonClipVolumes.length > 0) {
      this.removePolygonClipVolume(this.polygonClipVolumes[0]);
    }
  }

  getActiveCamera() {
    return this.cameraMode === CameraMode.PERSPECTIVE ? this.cameraP : this.cameraO;
  }

  initialize() {
    this.referenceFrame = new THREE.Object3D();
    this.referenceFrame.matrixAutoUpdate = false;
    this.scenePointCloud.add(this.referenceFrame);

    this.cameraP.up.set(0, 0, 1);
    this.cameraP.position.set(1000, 1000, 1000);
    this.cameraO.up.set(0, 0, 1);
    this.cameraO.position.set(1000, 1000, 1000);
    // this.camera.rotation.y = -Math.PI / 4;
    // this.camera.rotation.x = -Math.PI / 6;
    this.cameraScreenSpace.lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0));

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(10, 10, 10);
    this.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    this.scenePointCloud.add(this.directionalLight);

    const light = new THREE.AmbientLight(0x555555); // soft white light
    this.scenePointCloud.add(light);

    { // background
      const texture = Utils.createBackgroundTexture(512, 512);

      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      const bg = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 0),
        new THREE.MeshBasicMaterial({
          map: texture,
        }),
      );
      bg.material.depthTest = false;
      bg.material.depthWrite = false;
      this.sceneBG.add(bg);
    }

    { // lights
      {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(10, 10, 1);
        light.target.position.set(0, 0, 0);
        this.scene.add(light);
      }

      {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-10, 10, 1);
        light.target.position.set(0, 0, 0);
        this.scene.add(light);
      }

      {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -10, 20);
        light.target.position.set(0, 0, 0);
        this.scene.add(light);
      }
    }
  }

  addAnnotation(position, args = {}) {
    if (position instanceof Array) {
      args.position = new THREE.Vector3().fromArray(position);
    } else if (position instanceof THREE.Vector3) {
      args.position = position;
    }
    const annotation = new Annotation(args);
    this.annotations.add(annotation);

    return annotation;
  }

  getAnnotations() {
    return this.annotations;
  }

  removeAnnotation(annotationToRemove) {
    this.annotations.remove(annotationToRemove);
  }
}
