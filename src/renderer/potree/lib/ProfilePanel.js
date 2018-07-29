import $ from 'jquery';
import * as THREE from 'three';
import MeasurePanel from './MeasurePanel';

import Potree from '../potree';

export default class ProfilePanel extends MeasurePanel {
  constructor(viewer, measurement, propertiesPanel) {
    super(viewer, measurement, propertiesPanel);

    const removeIconPath = `${Potree.resourcePath}/icons/remove.svg`;
    this.elContent = $(`
  <div class="measurement_content selectable">
    <span class="coordinates_table_container"></span>
    <br>
    <span style="display:flex">
      <span style="display:flex; align-items: center; padding-right: 10px">Width: </span>
      <input id="sldProfileWidth" name="sldProfileWidth" value="5.06" style="flex-grow: 1; width:100%">
    </span>
    <br>

    <li style="margin-top: 10px">
      <input name="download_profile" type="button" value="prepare download" style="width: 100%" />
      <div name="download_message"></div>
    </li>

    <br>

    <input type="button" id="show_2d_profile" value="show 2d profile" style="width: 100%"/>

    <!-- ACTIONS -->
    <div style="display: flex; margin-top: 12px">
      <span></span>
      <span style="flex-grow: 1"></span>
      <img name="remove" class="button-icon" src="${removeIconPath}" style="width: 16px; height: 16px"/>
    </div>
  </div>
`);

    this.elRemove = this.elContent.find('img[name=remove]');
    this.elRemove.click(() => {
      this.viewer.scene.removeProfile(measurement);
    });

    { // download
      this.elDownloadButton = this.elContent.find('input[name=download_profile]');

      if (this.propertiesPanel.viewer.server) {
        this.elDownloadButton.click(() => this.download());
      } else {
        this.elDownloadButton.hide();
      }
    }

    { // width spinner
      const elWidthSlider = this.elContent.find('#sldProfileWidth');

      elWidthSlider.spinner({
        min: 0,
        max: 10 * 1000 * 1000,
        step: 0.01,
        numberFormat: 'n',
        start: () => { },
        spin: (event, ui) => {
          const value = elWidthSlider.spinner('value');
          measurement.setWidth(value);
        },
        change: (event, ui) => {
          const value = elWidthSlider.spinner('value');
          measurement.setWidth(value);
        },
        stop: (event, ui) => {
          const value = elWidthSlider.spinner('value');
          measurement.setWidth(value);
        },
        incremental: (count) => {
          const value = elWidthSlider.spinner('value');
          const step = elWidthSlider.spinner('option', 'step');

          const delta = value * 0.05;
          const increments = Math.max(1, parseInt(delta / step));

          return increments;
        },
      });
      elWidthSlider.spinner('value', measurement.getWidth());
      elWidthSlider.spinner('widget').css('width', '100%');

      const widthListener = (event) => {
        const value = elWidthSlider.spinner('value');
        if (value !== measurement.getWidth()) {
          elWidthSlider.spinner('value', measurement.getWidth());
        }
      };
      this.propertiesPanel.addVolatileListener(measurement, 'width_changed', widthListener);
    }

    const elShow2DProfile = this.elContent.find('#show_2d_profile');
    elShow2DProfile.click(() => {
      this.propertiesPanel.viewer.profileWindow.show();
      this.propertiesPanel.viewer.profileWindowController.setProfile(measurement);
    });

    this.propertiesPanel.addVolatileListener(measurement, 'marker_added', this._update);
    this.propertiesPanel.addVolatileListener(measurement, 'marker_removed', this._update);
    this.propertiesPanel.addVolatileListener(measurement, 'marker_moved', this._update);

    this.update();
  }

  update() {
    const elCoordiantesContainer = this.elContent.find('.coordinates_table_container');
    elCoordiantesContainer.empty();
    elCoordiantesContainer.append(this.createCoordinatesTable(this.measurement.points));
  }

  async download() {
    const profile = this.measurement;

    const regions = [];
    {
      const segments = profile.getSegments();
      const width = profile.width;

      for (const segment of segments) {
        const start = segment.start.clone().multiply(new THREE.Vector3(1, 1, 0));
        const end = segment.end.clone().multiply(new THREE.Vector3(1, 1, 0));
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        const startEndDir = new THREE.Vector3().subVectors(end, start).normalize();
        const endStartDir = new THREE.Vector3().subVectors(start, end).normalize();
        const upDir = new THREE.Vector3(0, 0, 1);
        const rightDir = new THREE.Vector3().crossVectors(startEndDir, upDir);
        const leftDir = new THREE.Vector3().crossVectors(endStartDir, upDir);

        console.log(leftDir);

        const right = rightDir.clone().multiplyScalar(width * 0.5).add(center);
        const left = leftDir.clone().multiplyScalar(width * 0.5).add(center);

        const planes = [
          new THREE.Plane().setFromNormalAndCoplanarPoint(startEndDir, start),
          new THREE.Plane().setFromNormalAndCoplanarPoint(endStartDir, end),
          new THREE.Plane().setFromNormalAndCoplanarPoint(leftDir, right),
          new THREE.Plane().setFromNormalAndCoplanarPoint(rightDir, left),
        ];

        const planeQueryParts = [];
        for (const plane of planes) {
          let part = [plane.normal.toArray(), plane.constant].join(',');
          part = `[${part}]`;
          planeQueryParts.push(part);
        }
        const region = `[${planeQueryParts.join(',')}]`;
        regions.push(region);
      }
    }

    const regionsArg = regions.join(',');

    const pointcloudArgs = [];
    for (const pointcloud of this.viewer.scene.pointclouds) {
      if (!pointcloud.visible) {
        continue;
      }

      const offset = pointcloud.pcoGeometry.offset.clone();
      const negateOffset = new THREE.Matrix4().makeTranslation(...offset.multiplyScalar(-1).toArray());
      const matrixWorld = pointcloud.matrixWorld;

      const transform = new THREE.Matrix4().multiplyMatrices(matrixWorld, negateOffset);

      const path = `${window.location.pathname}/../${pointcloud.pcoGeometry.url}`;

      const arg = {
        path,
        transform: transform.elements,
      };
      const argString = JSON.stringify(arg);

      pointcloudArgs.push(argString);
    }
    const pointcloudsArg = pointcloudArgs.join(',');

    const elMessage = this.elContent.find('div[name=download_message]');

    const error = (message) => {
      elMessage.html(`<div style="color: #ff0000">ERROR: ${message}</div>`);
    };

    const info = (message) => {
      elMessage.html(`${message}`);
    };

    let handle = null;
    { // START FILTER
      const url = `${viewer.server}/create_regions_filter?pointclouds=[${pointcloudsArg}]&regions=[${regionsArg}]`;

      // console.log(url);

      info('estimating results ...');

      const response = await fetch(url);
      const jsResponse = await response.json();
      // console.log(jsResponse);

      if (!jsResponse.handle) {
        error(jsResponse.message);
        return;
      }
      handle = jsResponse.handle;
    }

    { // WAIT, CHECK PROGRESS, HANDLE FINISH
      const url = `${viewer.server}/check_regions_filter?handle=${handle}`;

      const sleep = (function (duration) {
        return new Promise((res, rej) => {
          setTimeout(() => {
            res();
          }, duration);
        });
      });

      const handleFiltering = (jsResponse) => {
        const { progress, estimate } = jsResponse;

        const progressFract = progress['processed points'] / estimate.points;
        const progressPercents = parseInt(progressFract * 100);

        info(`progress: ${progressPercents}%`);
      };

      const handleFinish = (jsResponse) => {
        let message = 'downloads ready: <br>';
        message += '<ul>';

        for (let i = 0; i < jsResponse.pointclouds.length; i++) {
          const url = `${viewer.server}/download_regions_filter_result?handle=${handle}&index=${i}`;

          message += `<li><a href="${url}">result_${i}.las</a> </li>\n`;
        }

        const reportURL = `${viewer.server}/download_regions_filter_report?handle=${handle}`;
        message += `<li> <a href="${reportURL}">report.json</a> </li>\n`;
        message += '</ul>';

        info(message);
      };

      const handleUnexpected = (jsResponse) => {
        const message = `Unexpected Response. <br>status: ${jsResponse.status} <br>message: ${jsResponse.message}`;
        info(message);
      };

      const handleError = (jsResponse) => {
        const message = `ERROR: ${jsResponse.message}`;
        error(message);

        throw new Error(message);
      };

      const start = Date.now();

      while (true) {
        const response = await fetch(url);
        const jsResponse = await response.json();

        if (jsResponse.status === 'ERROR') {
          handleError(jsResponse);
        } else if (jsResponse.status === 'FILTERING') {
          handleFiltering(jsResponse);
        } else if (jsResponse.status === 'FINISHED') {
          handleFinish(jsResponse);

          break;
        } else {
          handleUnexpected(jsResponse);
        }

        const durationS = (Date.now() - start) / 1000;
        const sleepAmountMS = durationS < 10 ? 100 : 1000;

        await sleep(sleepAmountMS);
      }
    }
  }
}
