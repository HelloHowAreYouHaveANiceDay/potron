import * as THREE from 'three';
import TWEEN from 'tweenjs';
import shapefile from 'shapefile';

import { XHRFactory } from './XHRFactory.js';
import { Volume } from './utils/Volume.js';
import { Profile } from './utils/Profile.js';
import { Measure } from './utils/Measure.js';
import { PolygonClipVolume } from './utils/PolygonClipVolume.js';
import { PointColorType } from './defines.js';
import { resourcePath } from './Potree';


export default class Utils {
  static loadShapefileFeatures(file, callback) {
    const features = [];

    const handleFinish = () => {
      callback(features);
    };

    shapefile.open(file)
      .then((source) => {
        source.read()
          .then(function log(result) {
            if (result.done) {
              handleFinish();
              return;
            }

            // console.log(result.value);

            if (result.value && result.value.type === 'Feature' && result.value.geometry !== undefined) {
              features.push(result.value);
            }

            return source.read().then(log);
          });
      });
  }

  static toString(value) {
    if (value instanceof THREE.Vector3) {
      return `${value.x.toFixed(2)}, ${value.y.toFixed(2)}, ${value.z.toFixed(2)}`;
    }
    return `${value}`;
  }

  static normalizeURL(url) {
    const u = new URL(url);

    return `${u.protocol}//${u.hostname}${u.pathname.replace(/\/+/g, '/')}`;
  }

  static pathExists(url) {
    const req = XHRFactory.createXMLHttpRequest();
    req.open('GET', url, false);
    req.send(null);
    if (req.status !== 200) {
      return false;
    }
    return true;
  }

  static debugSphere(parent, position, scale, color) {
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    let material;

    if (color !== undefined) {
      material = new THREE.MeshBasicMaterial({ color });
    } else {
      material = new THREE.MeshNormalMaterial();
    }
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    sphere.scale.set(scale, scale, scale);
    parent.add(sphere);
  }

  static debugLine(parent, start, end, color) {
    const material = new THREE.LineBasicMaterial({ color });
    const geometry = new THREE.Geometry();
    geometry.vertices.push(start, end);
    const tl = new THREE.Line(geometry, material);
    parent.add(tl);
  }

  static debugBox(parent, box, transform = new THREE.Matrix4(), color = 0xFFFF00) {
    const vertices = [
      [box.min.x, box.min.y, box.min.z],
      [box.min.x, box.min.y, box.max.z],
      [box.min.x, box.max.y, box.min.z],
      [box.min.x, box.max.y, box.max.z],

      [box.max.x, box.min.y, box.min.z],
      [box.max.x, box.min.y, box.max.z],
      [box.max.x, box.max.y, box.min.z],
      [box.max.x, box.max.y, box.max.z],
    ].map(v => new THREE.Vector3(...v));

    const edges = [
      [0, 4], [4, 5], [5, 1], [1, 0],
      [2, 6], [6, 7], [7, 3], [3, 2],
      [0, 2], [4, 6], [5, 7], [1, 3],
    ];

    const center = box.getCenter(new THREE.Vector3());

    const centroids = [
      { position: [box.min.x, center.y, center.z], color: 0xFF0000 },
      { position: [box.max.x, center.y, center.z], color: 0x880000 },

      { position: [center.x, box.min.y, center.z], color: 0x00FF00 },
      { position: [center.x, box.max.y, center.z], color: 0x008800 },

      { position: [center.x, center.y, box.min.z], color: 0x0000FF },
      { position: [center.x, center.y, box.max.z], color: 0x000088 },
    ];

    for (const vertex of vertices) {
      const pos = vertex.clone().applyMatrix4(transform);

      Utils.debugSphere(parent, pos, 0.1, 0xFF0000);
    }

    for (const edge of edges) {
      const start = vertices[edge[0]].clone().applyMatrix4(transform);
      const end = vertices[edge[1]].clone().applyMatrix4(transform);

      Utils.debugLine(parent, start, end, color);
    }

    for (const centroid of centroids) {
      const pos = new THREE.Vector3(...centroid.position).applyMatrix4(transform);

      Utils.debugSphere(parent, pos, 0.1, centroid.color);
    }
  }

  static debugPlane(parent, plane, size = 1, color = 0x0000FF) {
    const planehelper = new THREE.PlaneHelper(plane, size, color);

    parent.add(planehelper);
  }

  /**
  * adapted from mhluska at https://github.com/mrdoob/three.js/issues/1561
  */
  static computeTransformedBoundingBox(box, transform) {
    const vertices = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
      new THREE.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z).applyMatrix4(transform),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z).applyMatrix4(transform),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z).applyMatrix4(transform),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z).applyMatrix4(transform),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z).applyMatrix4(transform),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z).applyMatrix4(transform),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z).applyMatrix4(transform),
    ];

    const boundingBox = new THREE.Box3();
    boundingBox.setFromPoints(vertices);

    return boundingBox;
  }

  /**
	* add separators to large numbers
	*
	* @param nStr
	* @returns
	*/
  static addCommas(nStr) {
    nStr += '';
    const x = nStr.split('.');
    let x1 = x[0];
    const x2 = x.length > 1 ? `.${x[1]}` : '';
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

  static removeCommas(str) {
    return str.replace(/,/g, '');
  }

  /**
	* create worker from a string
	*
	* code from http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
	*/
  static createWorker(code) {
    const blob = new Blob([code], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    return worker;
  }

  static moveTo(scene, endPosition, endTarget) {
    const view = scene.view;
    const camera = scene.getActiveCamera();
    const animationDuration = 500;
    const easing = TWEEN.Easing.Quartic.Out;

    { // animate camera position
      const tween = new TWEEN.Tween(view.position).to(endPosition, animationDuration);
      tween.easing(easing);
      tween.start();
    }

    { // animate camera target
      const camTargetDistance = camera.position.distanceTo(endTarget);
      const target = new THREE.Vector3().addVectors(
        camera.position,
        camera.getWorldDirection(new THREE.Vector3()).clone().multiplyScalar(camTargetDistance),
      );
      const tween = new TWEEN.Tween(target).to(endTarget, animationDuration);
      tween.easing(easing);
      tween.onUpdate(() => {
        view.lookAt(target);
      });
      tween.onComplete(() => {
        view.lookAt(target);
      });
      tween.start();
    }
  }

  static loadSkybox(path) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    camera.up.set(0, 0, 1);
    const scene = new THREE.Scene();

    const format = '.jpg';
    const urls = [
      `${path}px${format}`, `${path}nx${format}`,
      `${path}py${format}`, `${path}ny${format}`,
      `${path}pz${format}`, `${path}nz${format}`,
    ];

    const materialArray = [];
    {
      for (let i = 0; i < 6; i++) {
        const material = new THREE.MeshBasicMaterial({
          map: null,
          side: THREE.BackSide,
          depthTest: false,
          depthWrite: false,
          color: 0x424556,
        });

        materialArray.push(material);

        const loader = new THREE.TextureLoader();
        loader.load(urls[i],
          (texture) => {
            material.map = texture;
            material.needsUpdate = true;
            material.color.setHex(0xffffff);
          }, (xhr) => {
            console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
          }, (xhr) => {
            console.log('An error happened', xhr);
          },
        );
      }
    }

    const skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
    const skybox = new THREE.Mesh(skyGeometry, materialArray);

    scene.add(skybox);

    // z up
    scene.rotation.x = Math.PI / 2;

    return { camera, scene };
  }

  static createGrid(width, length, spacing, color) {
    const material = new THREE.LineBasicMaterial({
      color: color || 0x888888,
    });

    const geometry = new THREE.Geometry();
    for (let i = 0; i <= length; i++) {
      geometry.vertices.push(new THREE.Vector3(-(spacing * width) / 2, i * spacing - (spacing * length) / 2, 0));
      geometry.vertices.push(new THREE.Vector3(+(spacing * width) / 2, i * spacing - (spacing * length) / 2, 0));
    }

    for (let i = 0; i <= width; i++) {
      geometry.vertices
        .push(new THREE.Vector3(i * spacing - (spacing * width) / 2, -(spacing * length) / 2, 0));
      geometry.vertices
        .push(new THREE.Vector3(i * spacing - (spacing * width) / 2, +(spacing * length) / 2, 0));
    }

    const line = new THREE.LineSegments(geometry, material, THREE.LinePieces);
    line.receiveShadow = true;
    return line;
  }

  static createBackgroundTexture(width, height) {
    function gauss(x, y) {
      return (1 / (2 * Math.PI)) * Math.exp(-(x * x + y * y) / 2);
    }

    // map.magFilter = THREE.NearestFilter;
    const size = width * height;
    const data = new Uint8Array(3 * size);

    const chroma = [1, 1.5, 1.7];
    const max = gauss(0, 0);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const u = 2 * (x / width) - 1;
        const v = 2 * (y / height) - 1;

        const i = x + width * y;
        const d = gauss(2 * u, 2 * v) / max;
        let r = (Math.random() + Math.random() + Math.random()) / 3;
        r = (d * 0.5 + 0.5) * r * 0.03;
        r *= 0.4;

        // d = Math.pow(d, 0.6);

        data[3 * i + 0] = 255 * (d / 15 + 0.05 + r) * chroma[0];
        data[3 * i + 1] = 255 * (d / 15 + 0.05 + r) * chroma[1];
        data[3 * i + 2] = 255 * (d / 15 + 0.05 + r) * chroma[2];
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
    texture.needsUpdate = true;

    return texture;
  }

  static getMousePointCloudIntersection(mouse, camera, viewer, pointclouds, params = {}) {
    const renderer = viewer.renderer;

    const nmouse = {
      x: (mouse.x / renderer.domElement.clientWidth) * 2 - 1,
      y: -(mouse.y / renderer.domElement.clientHeight) * 2 + 1,
    };

    const pickParams = {};

    if (params.pickClipped) {
      pickParams.pickClipped = params.pickClipped;
    }

    pickParams.x = mouse.x;
    pickParams.y = renderer.domElement.clientHeight - mouse.y;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(nmouse, camera);
    const ray = raycaster.ray;

    let selectedPointcloud = null;
    let closestDistance = Infinity;
    let closestIntersection = null;
    let closestPoint = null;

    for (const pointcloud of pointclouds) {
      const point = pointcloud.pick(viewer, camera, ray, pickParams);

      if (!point) {
        continue;
      }

      const distance = camera.position.distanceTo(point.position);

      if (distance < closestDistance) {
        closestDistance = distance;
        selectedPointcloud = pointcloud;
        closestIntersection = point.position;
        closestPoint = point;
      }
    }

    if (selectedPointcloud) {
      return {
        location: closestIntersection,
        distance: closestDistance,
        pointcloud: selectedPointcloud,
        point: closestPoint,
      };
    }
    return null;
  }

  static pixelsArrayToImage(pixels, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    pixels = new pixels.constructor(pixels);

    for (let i = 0; i < pixels.length; i++) {
      pixels[i * 4 + 3] = 255;
    }

    const imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    const img = new Image();
    img.src = canvas.toDataURL();
    // img.style.transform = "scaleY(-1)";

    return img;
  }

  static pixelsArrayToDataUrl(pixels, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    pixels = new pixels.constructor(pixels);

    for (let i = 0; i < pixels.length; i++) {
      pixels[i * 4 + 3] = 255;
    }

    const imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    const dataURL = canvas.toDataURL();

    return dataURL;
  }

  static pixelsArrayToCanvas(pixels, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    pixels = new pixels.constructor(pixels);

    // for (let i = 0; i < pixels.length; i++) {
    //	pixels[i * 4 + 3] = 255;
    // }

    // flip vertically
    const bytesPerLine = width * 4;
    for (let i = 0; i < parseInt(height / 2); i++) {
      const j = height - i - 1;

      const lineI = pixels.slice(i * bytesPerLine, i * bytesPerLine + bytesPerLine);
      const lineJ = pixels.slice(j * bytesPerLine, j * bytesPerLine + bytesPerLine);
      pixels.set(lineJ, i * bytesPerLine);
      pixels.set(lineI, j * bytesPerLine);
    }

    const imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    return canvas;
  }

  static removeListeners(dispatcher, type) {
    if (dispatcher._listeners === undefined) {
      return;
    }

    if (dispatcher._listeners[type]) {
      delete dispatcher._listeners[type];
    }
  }

  static mouseToRay(mouse, camera, width, height) {
    const normalizedMouse = {
      x: (mouse.x / width) * 2 - 1,
      y: -(mouse.y / height) * 2 + 1,
    };

    const vector = new THREE.Vector3(normalizedMouse.x, normalizedMouse.y, 0.5);
    const origin = new THREE.Vector3(normalizedMouse.x, normalizedMouse.y, 0);
    vector.unproject(camera);
    origin.unproject(camera);
    const direction = new THREE.Vector3().subVectors(vector, origin).normalize();

    const ray = new THREE.Ray(origin, direction);

    return ray;
  }

  static projectedRadius(radius, camera, distance, screenWidth, screenHeight) {
    if (camera instanceof THREE.OrthographicCamera) {
      return Utils.projectedRadiusOrtho(radius, camera.projectionMatrix, screenWidth, screenHeight);
    } else if (camera instanceof THREE.PerspectiveCamera) {
      return Utils.projectedRadiusPerspective(radius,
        camera.fov * Math.PI / 180,
        distance,
        screenHeight);
    }
    throw new Error('invalid parameters');
  }

  static projectedRadiusPerspective(radius, fov, distance, screenHeight) {
    let projFactor = (1 / Math.tan(fov / 2)) / distance;
    projFactor = projFactor * screenHeight / 2;

    return radius * projFactor;
  }

  static projectedRadiusOrtho(radius, proj, screenWidth, screenHeight) {
    let p1 = new THREE.Vector4(0);
    let p2 = new THREE.Vector4(radius);

    p1.applyMatrix4(proj);
    p2.applyMatrix4(proj);
    p1 = new THREE.Vector3(p1.x, p1.y, p1.z);
    p2 = new THREE.Vector3(p2.x, p2.y, p2.z);
    p1.x = (p1.x + 1.0) * 0.5 * screenWidth;
    p1.y = (p1.y + 1.0) * 0.5 * screenHeight;
    p2.x = (p2.x + 1.0) * 0.5 * screenWidth;
    p2.y = (p2.y + 1.0) * 0.5 * screenHeight;
    return p1.distanceTo(p2);
  }


  static topView(camera, node) {
    camera.position.set(0, 1, 0);
    camera.rotation.set(-Math.PI / 2, 0, 0);
    camera.zoomTo(node, 1);
  }

  static frontView(camera, node) {
    camera.position.set(0, 0, 1);
    camera.rotation.set(0, 0, 0);
    camera.zoomTo(node, 1);
  }

  static leftView(camera, node) {
    camera.position.set(-1, 0, 0);
    camera.rotation.set(0, -Math.PI / 2, 0);
    camera.zoomTo(node, 1);
  }

  static rightView(camera, node) {
    camera.position.set(1, 0, 0);
    camera.rotation.set(0, Math.PI / 2, 0);
    camera.zoomTo(node, 1);
  }

  /**
	 *
	 * 0: no intersection
	 * 1: intersection
	 * 2: fully inside
	 */
  static frustumSphereIntersection(frustum, sphere) {
    const planes = frustum.planes;
    const center = sphere.center;
    const negRadius = -sphere.radius;

    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < 6; i++) {
      const distance = planes[i].distanceToPoint(center);

      if (distance < negRadius) {
        return 0;
      }

      minDistance = Math.min(minDistance, distance);
    }

    return (minDistance >= sphere.radius) ? 2 : 1;
  }

  // code taken from three.js
  // ImageUtils - generateDataTexture()
  static generateDataTexture(width, height, color) {
    const size = width * height;
    const data = new Uint8Array(4 * width * height);

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    for (let i = 0; i < size; i++) {
      data[i * 3] = r;
      data[i * 3 + 1] = g;
      data[i * 3 + 2] = b;
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;

    return texture;
  }

  // from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  static getParameterByName(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(document.location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  static setParameter(name, value) {
    // value = encodeURIComponent(value);

    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`([\\?&])(${name}=([^&#]*))`);
    const results = regex.exec(document.location.search);

    let url = window.location.href;
    if (results === null) {
      if (window.location.search.length === 0) {
        url += '?';
      } else {
        url += '&';
      }

      url = `${url + name}=${value}`;
    } else {
      const newValue = `${name}=${value}`;
      url = url.replace(results[2], newValue);
    }
    window.history.replaceState({}, '', url);
  }

  static createChildAABB(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = new THREE.Vector3().subVectors(max, min);

    if ((index & 0b0001) > 0) {
      min.z += size.z / 2;
    } else {
      max.z -= size.z / 2;
    }

    if ((index & 0b0010) > 0) {
      min.y += size.y / 2;
    } else {
      max.y -= size.y / 2;
    }

    if ((index & 0b0100) > 0) {
      min.x += size.x / 2;
    } else {
      max.x -= size.x / 2;
    }

    return new THREE.Box3(min, max);
  }

  // see https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  static clipboardCopy(text) {
    const textArea = document.createElement('textarea');

    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    textArea.style.width = '2em';
    textArea.style.height = '2em';

    textArea.style.padding = 0;

    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
      const success = document.execCommand('copy');
      if (success) {
        console.log('copied text to clipboard');
      } else {
        console.log('copy to clipboard failed');
      }
    } catch (err) {
      console.log('error while trying to copy to clipboard');
    }

    document.body.removeChild(textArea);
  }

  static getMeasurementIcon(measurement) {
    if (measurement instanceof Measure) {
      if (measurement.showDistances && !measurement.showArea && !measurement.showAngles) {
        return `${resourcePath}/icons/distance.svg`;
      } else if (measurement.showDistances && measurement.showArea && !measurement.showAngles) {
        return `${resourcePath}/icons/area.svg`;
      } else if (measurement.maxMarkers === 1) {
        return `${resourcePath}/icons/point.svg`;
      } else if (!measurement.showDistances && !measurement.showArea && measurement.showAngles) {
        return `${resourcePath}/icons/angle.png`;
      } else if (measurement.showHeight) {
        return `${resourcePath}/icons/height.svg`;
      }
      return `${resourcePath}/icons/distance.svg`;
    } else if (measurement instanceof Profile) {
      return `${resourcePath}/icons/profile.svg`;
    } else if (measurement instanceof Volume) {
      return `${resourcePath}/icons/volume.svg`;
    } else if (measurement instanceof PolygonClipVolume) {
      return `${resourcePath}/icons/clip-polygon.svg`;
    }
    return false;
  }

  static toMaterialID(materialName) {
    if (materialName === 'RGB') {
      return PointColorType.RGB;
    } else if (materialName === 'Color') {
      return PointColorType.COLOR;
    } else if (materialName === 'Elevation') {
      return PointColorType.HEIGHT;
    } else if (materialName === 'Intensity') {
      return PointColorType.INTENSITY;
    } else if (materialName === 'Intensity Gradient') {
      return PointColorType.INTENSITY_GRADIENT;
    } else if (materialName === 'Classification') {
      return PointColorType.CLASSIFICATION;
    } else if (materialName === 'Return Number') {
      return PointColorType.RETURN_NUMBER;
    } else if (materialName === 'Source') {
      return PointColorType.SOURCE;
    } else if (materialName === 'Level of Detail') {
      return PointColorType.LOD;
    } else if (materialName === 'Point Index') {
      return PointColorType.POINT_INDEX;
    } else if (materialName === 'Normal') {
      return PointColorType.NORMAL;
    } else if (materialName === 'Phong') {
      return PointColorType.PHONG;
    } else if (materialName === 'Index') {
      return PointColorType.POINT_INDEX;
    } else if (materialName === 'RGB and Elevation') {
      return PointColorType.RGB_HEIGHT;
    } else if (materialName === 'Composite') {
      return PointColorType.COMPOSITE;
    }
    return false;
  }


  static toMaterialName(materialID) {
    if (materialID === PointColorType.RGB) {
      return 'RGB';
    } else if (materialID === PointColorType.COLOR) {
      return 'Color';
    } else if (materialID === PointColorType.HEIGHT) {
      return 'Elevation';
    } else if (materialID === PointColorType.INTENSITY) {
      return 'Intensity';
    } else if (materialID === PointColorType.INTENSITY_GRADIENT) {
      return 'Intensity Gradient';
    } else if (materialID === PointColorType.CLASSIFICATION) {
      return 'Classification';
    } else if (materialID === PointColorType.RETURN_NUMBER) {
      return 'Return Number';
    } else if (materialID === PointColorType.SOURCE) {
      return 'Source';
    } else if (materialID === PointColorType.LOD) {
      return 'Level of Detail';
    } else if (materialID === PointColorType.NORMAL) {
      return 'Normal';
    } else if (materialID === PointColorType.PHONG) {
      return 'Phong';
    } else if (materialID === PointColorType.POINT_INDEX) {
      return 'Index';
    } else if (materialID === PointColorType.RGB_HEIGHT) {
      return 'RGB and Elevation';
    } else if (materialID === PointColorType.COMPOSITE) {
      return 'Composite';
    }
    return false;
  }
}

Utils.screenPass = (function screenPass() {
  this.screenScene = new THREE.Scene();
  this.screenQuad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 0));
  this.screenQuad.material.depthTest = true;
  this.screenQuad.material.depthWrite = true;
  this.screenQuad.material.transparent = true;
  this.screenScene.add(this.screenQuad);
  this.camera = new THREE.Camera();

  this.render = function render(renderer, material, target) {
    this.screenQuad.material = material;

    if (typeof target === 'undefined') {
      renderer.render(this.screenScene, this.camera);
    } else {
      renderer.render(this.screenScene, this.camera, target);
    }
  };
}());
