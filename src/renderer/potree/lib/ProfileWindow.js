import $ from 'jquery';
import * as d3 from 'd3';
import * as THREE from 'three';

import EventDispatcher from './EventDispatcher';
import Utils from './Utils';
import CSVExporter from './CSVExporter';
import LASExporter from './LASExporter';
import Points from './Points';
import ProfilePointCloudEntry from './ProfilePointCloudEntry';

export default class ProfileWindow extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;
    this.elRoot = $('#profile_window');
    this.renderArea = this.elRoot.find('#profileCanvasContainer');
    this.svg = d3.select('svg#profileSVG');
    this.mouseIsDown = false;

    this.projectedBox = new THREE.Box3();
    this.pointclouds = new Map();
    this.numPoints = 0;
    this.lastAddPointsTimestamp = undefined;

    this.mouse = new THREE.Vector2(0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);

    const csvIcon = `${exports.resourcePath}/icons/file_csv_2d.svg`;
    $('#potree_download_csv_icon').attr('src', csvIcon);

    const lasIcon = `${exports.resourcePath}/icons/file_las_3d.svg`;
    $('#potree_download_las_icon').attr('src', lasIcon);

    const closeIcon = `${exports.resourcePath}/icons/close.svg`;
    $('#closeProfileContainer').attr('src', closeIcon);

    this.initTHREE();
    this.initSVG();
    this.initListeners();

    this.elRoot.i18n();
  }

  initListeners() {
    $(window).resize(() => {
      this.render();
    });

    this.renderArea.mousedown(() => {
      this.mouseIsDown = true;
    });

    this.renderArea.mouseup(() => {
      this.mouseIsDown = false;
    });

    const viewerPickSphereSizeHandler = () => {
      const camera = this.viewer.scene.getActiveCamera();
      const domElement = this.viewer.renderer.domElement;
      const distance = this.viewerPickSphere.position.distanceTo(camera.position);
      const pr = Utils.projectedRadius(1, camera, distance, domElement.clientWidth, domElement.clientHeight);
      const scale = (10 / pr);
      this.viewerPickSphere.scale.set(scale, scale, scale);
    };

    this.renderArea.mousemove((e) => {
      if (this.pointclouds.size === 0) {
        return;
      }

      const rect = this.renderArea[0].getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newMouse = new THREE.Vector2(x, y);

      if (this.mouseIsDown) {
        // DRAG
        this.autoFit = false;
        this.lastDrag = new Date().getTime();

        const cPos = [this.scaleX.invert(this.mouse.x), this.scaleY.invert(this.mouse.y)];
        const ncPos = [this.scaleX.invert(newMouse.x), this.scaleY.invert(newMouse.y)];

        this.camera.position.x -= ncPos[0] - cPos[0];
        this.camera.position.z -= ncPos[1] - cPos[1];

        this.render();
      } else if (this.pointclouds.size > 0) {
        // FIND HOVERED POINT
        const radius = Math.abs(this.scaleX.invert(0) - this.scaleX.invert(40));
        const mileage = this.scaleX.invert(newMouse.x);
        const elevation = this.scaleY.invert(newMouse.y);

        const point = this.selectPoint(mileage, elevation, radius);

        if (point) {
          this.elRoot.find('#profileSelectionProperties').fadeIn(200);
          this.pickSphere.visible = true;
          this.pickSphere.scale.set(0.5 * radius, 0.5 * radius, 0.5 * radius);
          this.pickSphere.position.set(point.mileage, 0, point.position[2]);

          this.viewerPickSphere.position.set(...point.position);

          if (!this.viewer.scene.scene.children.includes(this.viewerPickSphere)) {
            this.viewer.scene.scene.add(this.viewerPickSphere);
            if (!this.viewer.hasEventListener('update', viewerPickSphereSizeHandler)) {
              this.viewer.addEventListener('update', viewerPickSphereSizeHandler);
            }
          }


          const info = this.elRoot.find('#profileSelectionProperties');
          let html = '<table>';
          for (const attribute of Object.keys(point)) {
            const value = point[attribute];
            if (attribute === 'position') {
              const values = [...value].map(v => Utils.addCommas(v.toFixed(3)));
              html += `
            <tr>
              <td>x</td>
              <td>${values[0]}</td>
            </tr>
            <tr>
              <td>y</td>
              <td>${values[1]}</td>
            </tr>
            <tr>
              <td>z</td>
              <td>${values[2]}</td>
            </tr>`;
            } else if (attribute === 'color') {
              html += `
            <tr>
              <td>${attribute}</td>
              <td>${value.join(', ')}</td>
            </tr>`;
            } else if (attribute === 'normal') {
              continue;
            } else if (attribute === 'mileage') {
              html += `
            <tr>
              <td>${attribute}</td>
              <td>${value.toFixed(3)}</td>
            </tr>`;
            } else {
              html += `
            <tr>
              <td>${attribute}</td>
              <td>${value}</td>
            </tr>`;
            }
          }
          html += '</table>';
          info.html(html);

          this.selectedPoint = point;
        } else {
          // this.pickSphere.visible = false;
          // this.selectedPoint = null;

          this.viewer.scene.scene.add(this.viewerPickSphere);

          const index = this.viewer.scene.scene.children.indexOf(this.viewerPickSphere);
          if (index >= 0) {
            this.viewer.scene.scene.children.splice(index, 1);
          }
          this.viewer.removeEventListener('update', viewerPickSphereSizeHandler);
        }
        this.render();
      }

      this.mouse.copy(newMouse);
    });

    const onWheel = (e) => {
      this.autoFit = false;
      let delta = 0;
      if (e.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
        delta = e.wheelDelta;
      } else if (e.detail !== undefined) { // Firefox
        delta = -e.detail;
      }

      const ndelta = Math.sign(delta);

      const cPos = [this.scaleX.invert(this.mouse.x), this.scaleY.invert(this.mouse.y)];

      if (ndelta > 0) {
        // + 10%
        this.scale.multiplyScalar(1.1);
      } else {
        // - 10%
        this.scale.multiplyScalar(100 / 110);
      }

      this.updateScales();
      const ncPos = [this.scaleX.invert(this.mouse.x), this.scaleY.invert(this.mouse.y)];

      this.camera.position.x -= ncPos[0] - cPos[0];
      this.camera.position.z -= ncPos[1] - cPos[1];

      this.render();
      this.updateScales();
    };
    $(this.renderArea)[0].addEventListener('mousewheel', onWheel, false);
    $(this.renderArea)[0].addEventListener('DOMMouseScroll', onWheel, false); // Firefox

    $('#closeProfileContainer').click(() => {
      this.hide();
    });

    $('#potree_download_csv_icon').click(() => {
      const points = new Points();

      for (const [pointcloud, entry] of this.pointclouds) {
        for (const pointSet of entry.points) {
          points.add(pointSet);
        }
      }

      const string = CSVExporter.toString(points);

      const blob = new Blob([string], { type: 'text/string' });
      $('#potree_download_profile_ortho_link').attr('href', URL.createObjectURL(blob));

      // let uri = 'data:application/octet-stream;base64,' + btoa(string);
      // $('#potree_download_profile_ortho_link').attr('href', uri);
    });

    $('#potree_download_las_icon').click(() => {
      const points = new Points();

      for (const [pointcloud, entry] of this.pointclouds) {
        for (const pointSet of entry.points) {
          points.add(pointSet);
        }
      }

      const buffer = LASExporter.toLAS(points);

      const blob = new Blob([buffer], { type: 'application/octet-binary' });
      $('#potree_download_profile_link').attr('href', URL.createObjectURL(blob));

      // let u8view = new Uint8Array(buffer);
      // let binString = '';
      // for (let i = 0; i < u8view.length; i++) {
      //	binString += String.fromCharCode(u8view[i]);
      // }
      //
      // let uri = 'data:application/octet-stream;base64,' + btoa(binString);
      // $('#potree_download_profile_link').attr('href', uri);
    });
  }

  selectPoint(mileage, elevation, radius) {
    let closest = {
      distance: Infinity,
      pointcloud: null,
      points: null,
      index: null,
    };

    const pointBox = new THREE.Box2(
      new THREE.Vector2(mileage - radius, elevation - radius),
      new THREE.Vector2(mileage + radius, elevation + radius));

      // let debugNode = this.scene.getObjectByName("select_debug_node");
      // if(!debugNode){
      //	debugNode = new THREE.Object3D();
      //	debugNode.name = "select_debug_node";
      //	this.scene.add(debugNode);
      // }
      // debugNode.children = [];
      // let debugPointBox = new THREE.Box3(
      //	new THREE.Vector3(...pointBox.min.toArray(), -1),
      //	new THREE.Vector3(...pointBox.max.toArray(), +1)
      // );
      // debugNode.add(new Box3Helper(debugPointBox, 0xff0000));

    let numTested = 0;
    let numSkipped = 0;
    let numTestedPoints = 0;
    let numSkippedPoints = 0;

    for (const [pointcloud, entry] of this.pointclouds) {
      for (const points of entry.points) {
        const collisionBox = new THREE.Box2(
          new THREE.Vector2(points.projectedBox.min.x, points.projectedBox.min.z),
          new THREE.Vector2(points.projectedBox.max.x, points.projectedBox.max.z),
        );

        const intersects = collisionBox.intersectsBox(pointBox);

        if (!intersects) {
          numSkipped++;
          numSkippedPoints += points.numPoints;
          continue;
        }

        // let debugCollisionBox = new THREE.Box3(
        //	new THREE.Vector3(...collisionBox.min.toArray(), -1),
        //	new THREE.Vector3(...collisionBox.max.toArray(), +1)
        // );
        // debugNode.add(new Box3Helper(debugCollisionBox));

        numTested++;
        numTestedPoints += points.numPoints;

        for (let i = 0; i < points.numPoints; i++) {
          const m = points.data.mileage[i] - mileage;
          const e = points.data.position[3 * i + 2] - elevation;

          const r = Math.sqrt(m * m + e * e);

          if (r < radius && r < closest.distance) {
            closest = {
              distance: r,
              pointcloud,
              points,
              index: i,
            };
          }
        }
      }
    }


    console.log(`nodes: ${numTested}, ${numSkipped} || points: ${numTestedPoints}, ${numSkippedPoints}`);

    if (closest.distance < Infinity) {
      const points = closest.points;

      const point = {};

      const attributes = Object.keys(points.data);
      for (const attribute of attributes) {
        const attributeData = points.data[attribute];
        const itemSize = attributeData.length / points.numPoints;
        const value = attributeData.subarray(itemSize * closest.index, itemSize * closest.index + itemSize);

        if (value.length === 1) {
          point[attribute] = value[0];
        } else {
          point[attribute] = value;
        }
      }

      return point;
    }
    return null;
  }

  initTHREE() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(10, 10);
    this.renderer.autoClear = true;
    this.renderArea.append($(this.renderer.domElement));
    this.renderer.domElement.tabIndex = '2222';
    this.renderer.context.getExtension('EXT_frag_depth');
    $(this.renderer.domElement).css('width', '100%');
    $(this.renderer.domElement).css('height', '100%');

    this.camera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000, -1000, 1000);
    this.camera.up.set(0, 0, 1);
    this.camera.rotation.order = 'ZXY';
    this.camera.rotation.x = Math.PI / 2.0;


    this.scene = new THREE.Scene();

    const sg = new THREE.SphereGeometry(1, 16, 16);
    const sm = new THREE.MeshNormalMaterial();
    this.pickSphere = new THREE.Mesh(sg, sm);
    // this.pickSphere.visible = false;
    this.scene.add(this.pickSphere);

    this.viewerPickSphere = new THREE.Mesh(sg, sm);

    this.pointCloudRoot = new THREE.Object3D();
    this.scene.add(this.pointCloudRoot);
  }

  initSVG() {
    const width = this.renderArea[0].clientWidth;
    const height = this.renderArea[0].clientHeight;
    const marginLeft = this.renderArea[0].offsetLeft;

    this.svg.selectAll('*').remove();

    this.scaleX = d3.scale.linear()
      .domain([this.camera.left + this.camera.position.x, this.camera.right + this.camera.position.x])
      .range([0, width]);
    this.scaleY = d3.scale.linear()
      .domain([this.camera.bottom + this.camera.position.z, this.camera.top + this.camera.position.z])
      .range([height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.scaleX)
      .orient('bottom')
      .innerTickSize(-height)
      .outerTickSize(1)
      .tickPadding(10)
      .ticks(width / 50);

    this.yAxis = d3.svg.axis()
      .scale(this.scaleY)
      .orient('left')
      .innerTickSize(-width)
      .outerTickSize(1)
      .tickPadding(10)
      .ticks(height / 20);

    this.elXAxis = this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(${marginLeft}, ${height})`)
      .call(this.xAxis);

    this.elYAxis = this.svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${marginLeft}, 0)`)
      .call(this.yAxis);
  }

  setProfile(profile) {
    this.render();
  }

  addPoints(pointcloud, points) {
    // this.lastAddPointsTimestamp = new Date().getTime();

    let entry = this.pointclouds.get(pointcloud);
    if (!entry) {
      entry = new ProfilePointCloudEntry();
      this.pointclouds.set(pointcloud, entry);

      const materialChanged = () => this.render();
      pointcloud.material.addEventListener('material_property_changed', materialChanged);
      this.addEventListener('on_reset_once', () => {
        pointcloud.material.removeEventListener('material_property_changed', materialChanged);
      });
    }

    entry.addPoints(points);
    this.pointCloudRoot.add(entry.sceneNode);
    this.projectedBox.union(entry.projectedBox);
    // console.log(this.projectedBox.min.toArray().map(v => v.toFixed(2)).join(", "));
    // console.log(this.projectedBox.getSize().toArray().map(v => v.toFixed(2)).join(", "));

    if (this.autoFit) {
      const width = this.renderArea[0].clientWidth;
      const height = this.renderArea[0].clientHeight;

      const size = this.projectedBox.getSize(new THREE.Vector3());

      const sx = width / size.x;
      const sy = height / size.z;
      const scale = Math.min(sx, sy);

      const center = this.projectedBox.getCenter(new THREE.Vector3());
      this.scale.set(scale, scale, 1);
      this.camera.position.copy(center);

      // console.log("camera: ", this.camera.position.toArray().join(", "));
    }

    // console.log(entry);

    this.render();

    let numPoints = 0;
    for (const [key, value] of this.pointclouds.entries()) {
      numPoints += value.points.reduce((a, i) => a + i.numPoints, 0);
    }
    $('#profile_num_points').html(Utils.addCommas(numPoints));
  }

  reset() {
    this.lastReset = new Date().getTime();

    this.dispatchEvent({ type: 'on_reset_once' });
    this.removeEventListeners('on_reset_once');

    this.autoFit = true;
    this.projectedBox = new THREE.Box3();

    for (const [key, entry] of this.pointclouds) {
      entry.dispose();
    }

    this.pointclouds.clear();
    this.mouseIsDown = false;
    this.mouse.set(0, 0);
    this.scale.set(1, 1, 1);
    this.pickSphere.visible = false;

    this.pointCloudRoot.children = [];

    this.elRoot.find('#profileSelectionProperties').hide();

    this.render();
  }

  show() {
    this.elRoot.fadeIn();
    this.enabled = true;
  }

  hide() {
    this.elRoot.fadeOut();
    this.enabled = false;
  }

  updateScales() {
    const width = this.renderArea[0].clientWidth;
    const height = this.renderArea[0].clientHeight;

    const left = (-width / 2) / this.scale.x;
    const right = (+width / 2) / this.scale.x;
    const top = (+height / 2) / this.scale.y;
    const bottom = (-height / 2) / this.scale.y;

    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();

    this.scaleX.domain([this.camera.left + this.camera.position.x, this.camera.right + this.camera.position.x])
      .range([0, width]);
    this.scaleY.domain([this.camera.bottom + this.camera.position.z, this.camera.top + this.camera.position.z])
      .range([height, 0]);

    const marginLeft = this.renderArea[0].offsetLeft;

    this.xAxis.scale(this.scaleX)
      .orient('bottom')
      .innerTickSize(-height)
      .outerTickSize(1)
      .tickPadding(10)
      .ticks(width / 50);
    this.yAxis.scale(this.scaleY)
      .orient('left')
      .innerTickSize(-width)
      .outerTickSize(1)
      .tickPadding(10)
      .ticks(height / 20);


    this.elXAxis
      .attr('transform', `translate(${marginLeft}, ${height})`)
      .call(this.xAxis);
    this.elYAxis
      .attr('transform', `translate(${marginLeft}, 0)`)
      .call(this.yAxis);
  }

  requestScaleUpdate() {
    const threshold = 100;
    const allowUpdate = ((this.lastReset === undefined) || (this.lastScaleUpdate === undefined))
        || ((new Date().getTime() - this.lastReset) > threshold && (new Date().getTime() - this.lastScaleUpdate) > threshold);

    if (allowUpdate) {
      this.updateScales();

      this.lastScaleUpdate = new Date().getTime();


      this.scaleUpdatePending = false;
    } else if (!this.scaleUpdatePending) {
      setTimeout(this.requestScaleUpdate.bind(this), 100);
      this.scaleUpdatePending = true;
    }
  }

  render() {
    const width = this.renderArea[0].clientWidth;
    const height = this.renderArea[0].clientHeight;

    // this.updateScales();

    { // THREEJS
      const radius = Math.abs(this.scaleX.invert(0) - this.scaleX.invert(5));
      this.pickSphere.scale.set(radius, radius, radius);
      // this.pickSphere.position.z = this.camera.far - radius;
      // this.pickSphere.position.y = 0;

      for (const [pointcloud, entry] of this.pointclouds) {
        const material = entry.material;

        material.pointColorType = pointcloud.material.pointColorType;
        material.uniforms.uColor = pointcloud.material.uniforms.uColor;
        material.uniforms.intensityRange.value = pointcloud.material.uniforms.intensityRange.value;
        material.elevationRange = pointcloud.material.elevationRange;

        material.rgbGamma = pointcloud.material.rgbGamma;
        material.rgbContrast = pointcloud.material.rgbContrast;
        material.rgbBrightness = pointcloud.material.rgbBrightness;

        material.intensityRange = pointcloud.material.intensityRange;
        material.intensityGamma = pointcloud.material.intensityGamma;
        material.intensityContrast = pointcloud.material.intensityContrast;
        material.intensityBrightness = pointcloud.material.intensityBrightness;

        material.uniforms.wRGB.value = pointcloud.material.uniforms.wRGB.value;
        material.uniforms.wIntensity.value = pointcloud.material.uniforms.wIntensity.value;
        material.uniforms.wElevation.value = pointcloud.material.uniforms.wElevation.value;
        material.uniforms.wClassification.value = pointcloud.material.uniforms.wClassification.value;
        material.uniforms.wReturnNumber.value = pointcloud.material.uniforms.wReturnNumber.value;
        material.uniforms.wSourceID.value = pointcloud.material.uniforms.wSourceID.value;
      }

      this.pickSphere.visible = true;

      this.renderer.setSize(width, height);

      this.renderer.render(this.scene, this.camera);
    }

    this.requestScaleUpdate();
  }
}
