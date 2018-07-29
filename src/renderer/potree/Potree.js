import * as THREE from 'three';
import * as d3 from 'd3';
import jQuery from 'jquery';
import proj4 from 'proj4';
import BinaryHeap from './BinaryHeap';
import EventDispatcher from './lib/EventDispatcher';
import Action from './lib/Action';
import PathAnimation from './lib/PathAnimation';
import AnimationPath from './lib/AnimationPath';
import XHRFactory from './lib/XHRFactory';
import TextSprite from './lib/TextSprite';
import Volume from './lib/Volume';
import BoxVolume from './lib/BoxVolume';
import SphereVolume from './lib/SphereVolume';
import Profile from './lib/Profile';
import Utils from './lib/Utils';
import Measure from './lib/Measure';
import PolygonClipVolume from './lib/PolygonClipVolume';
import PointColorType from './lib/PointColorType';
import EnumItem from './lib/EnumItem';
import Enum from './lib/Enum';
import CameraMode from './lib/CameraMode';
import ClipTask from './lib/ClipTask';
import ClipMethod from './lib/ClipMethod';
import MOUSE from './lib/MOUSE';
import PointSizeType from './lib/PointSizeType';
import PointShape from './lib/PointShape';
import TreeType from './lib/TreeType';
import Annotation from './lib/Annotation';
import Features from './lib/Features';
import KeyCodes from './lib/KeyCodes';
import LRUItem from './lib/LRUItem';
// import LRU from './lib/LRU';
import PointCloudTree from './lib/PointCloudTree';
import PointCloudTreeNode from './lib/PointCloudTreeNode';
import PointCloudGreyhoundGeometry from './lib/PointCloudGreyhoundGeometry';
import PointCloudGreyhoundGeometryNode from './lib/PointCloudGreyHoundGeometryNode';
import PointCloudOctreeGeometry from './lib/PointCloudOctreeGeometry';
import PointCloudOctreeGeometryNode from './lib/PointCloudOctreeGeometryNode';
import Gradients from './lib/Gradients';
// import Shaders from './lib/Shaders';
import ClassificationScheme from './lib/ClassificationScheme';
import PointCloudMaterial from './lib/PointCloudMaterial';
import PointCloudOctreeNode from './lib/PointCloudOctreeNode';
import PointCloudOctree from './lib/PointCloudOctree';
import Points from './lib/Points';
import Box3Helper from './lib/Box3Helper';
import PointCloudArena4DNode from './lib/PointCloudArena4DNode';
import Shader from './lib/Shader';
import attributeLocations from './lib/AttributeLocations';
import WebGLTexture from './lib/WebGLTexture';
// import paramThreeToGL from './lib/paramThreeToGL';
import WebGLBuffer from './lib/WebGLBuffer';

// import Renderer from './lib/Renderer';
import ProfileData from './lib/ProfileData';
import ProfileRequest from './lib/ProfileRequest';
import Version from './lib/Version';
import WorkerPool from './lib/WorkerPool';
import EyeDomeLightingMaterial from './lib/EyeDomeLightingMaterial';
import NormalizationEDLMaterial from './lib/NormalizationEDLMaterial';
import NormalizationMaterial from './lib/NormalizationMaterial';
import LasLazLoader from './lib/LasLazLoader';
import PointAttributeNames from './lib/PointAttributeNames';
import PointAttributeTypes from './lib/PointAttributeTypes';
import PointAttribute from './lib/PointAttribute';
import PointAttributes from './lib/PointAttributes';
import BinaryLoader from './lib/BinaryLoader';
import POCLoader from './lib/POCLoader';
import GreyhoundBinaryLoader from './lib/GreyhoundBinaryLoader';
import GreyhoundUtils from './lib/GreyhoundUtils';
import GreyhoundLoader from './lib/GreyhoundLoader';
import ClipVolume from './lib/ClipVolume';
import ClippingTool from './lib/ClippingTool';
import MeasuringTool from './lib/MeasuringTool';
import Message from './lib/Message';
import PointCloudSM from './lib/PointCloudSM';
import ProfileTool from './lib/ProfileTool';
import ScreenBoxSelectTool from './lib/ScreenBoxSelectTool';
import SpotLightHelper from './lib/SpotLightHelper';
import TransformationTool from './lib/TransformationTool';
import VolumeTool from './lib/VolumeTool';
import PotreeRenderer from './lib/PotreeRenderer';
import EDLRenderer from './lib/EDLRenderer';
import OrbitControls from './lib/OrbitControls';
import View from './lib/View';
import Scene from './lib/Scene';
import MapView from './lib/MapView';
import CSVExporter from './lib/CSVExporter';
import LASExporter from './lib/LASExporter';
import ProfilePointCloudEntry from './lib/ProfilePointCloudEntry';
import ProfileWindow from './lib/ProfileWindow';
import ProfileWindowController from './lib/ProfileWindowController';
import GeoJSONExporter from './lib/GeoJSONExporter';
import DXFExporter from './lib/DXFExporter';
import MeasurePanel from './lib/MeasurePanel';
import DistancePanel from './lib/DistancePanel';
import PointPanel from './lib/PointPanel';
import AreaPanel from './lib/AreaPanel';
import AnglePanel from './lib/AnglePanel';
import HeightPanel from './lib/HeightPanel';
import VolumePanel from './lib/VolumePanel';
import CameraPanel from './lib/CameraPanel';
import PropertiesPanel from './lib/PropertiesPanel';
import EarthControls from './lib/EarthControls';
import FirstPersonControls from './lib/FirstPersonControls';
// import BinaryDecoderWorker from './workers/BinaryDecoderWorker';
// import DEMWorker from './workers/DEMWorker';
// // import GreyhoundBinaryDecoderWorker from './workers/GreyhoundBinaryDecoderWorker';
// import LASDecoderWorker from './workers/LASDecoderWorker';
// import LazLoaderWorker from './workers/LazLoaderWorker';

const TWEEN = require('@tweenjs/tween.js');

const $ = jQuery;

const Potree = {};

(
  function (global, factory) {
    console.log('exports are', typeof exports);
    console.log('module are', typeof module);
    console.log('define are', typeof define);

    if (typeof exports === 'object' && typeof module !== 'undefined') {
      factory(exports);
    } else if (typeof define === 'function' && define.amd) {
      define(['exports'], factory);
    } else {
      (factory((Potree)));
    }
  }(this, ((exports) => {
    /**
       * @author mrdoob / http://mrdoob.com/ https://github.com/mrdoob/eventdispatcher.js
       *
       * with slight modifications by mschuetz, http://potree.org
       *
       */

    // The MIT License
    //
    // Copyright (c) 2011 Mr.doob
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.


    /**
       *
       * @class A doubly-linked-list of the least recently used elements.
       */
    class LRU {
      constructor() {
        // the least recently used item
        this.first = null;
        // the most recently used item
        this.last = null;
        // a list of all items in the lru list
        this.items = {};
        this.elements = 0;
        this.numPoints = 0;
      }

      size() {
        return this.elements;
      }

      contains(node) {
        return this.items[node.id] == null;
      }

      touch(node) {
        if (!node.loaded) {
          return;
        }

        let item;
        if (this.items[node.id] == null) {
          // add to list
          item = new LRUItem(node);
          item.previous = this.last;
          this.last = item;
          if (item.previous !== null) {
            item.previous.next = item;
          }

          this.items[node.id] = item;
          this.elements++;

          if (this.first === null) {
            this.first = item;
          }
          this.numPoints += node.numPoints;
        } else {
          // update in list
          item = this.items[node.id];
          if (item.previous === null) {
            // handle touch on first element
            if (item.next !== null) {
              this.first = item.next;
              this.first.previous = null;
              item.previous = this.last;
              item.next = null;
              this.last = item;
              item.previous.next = item;
            }
          } else if (item.next === null) {
            // handle touch on last element
          } else {
            // handle touch on any other element
            item.previous.next = item.next;
            item.next.previous = item.previous;
            item.previous = this.last;
            item.next = null;
            this.last = item;
            item.previous.next = item;
          }
        }
      }

      remove(node) {
        const lruItem = this.items[node.id];
        if (lruItem) {
          if (this.elements === 1) {
            this.first = null;
            this.last = null;
          } else {
            if (!lruItem.previous) {
              this.first = lruItem.next;
              this.first.previous = null;
            }
            if (!lruItem.next) {
              this.last = lruItem.previous;
              this.last.next = null;
            }
            if (lruItem.previous && lruItem.next) {
              lruItem.previous.next = lruItem.next;
              lruItem.next.previous = lruItem.previous;
            }
          }

          delete this.items[node.id];
          this.elements--;
          this.numPoints -= node.numPoints;
        }
      }

      getLRUItem() {
        if (this.first === null) {
          return null;
        }
        const lru = this.first;

        return lru.node;
      }

      toString() {
        let string = '{ ';
        let curr = this.first;
        while (curr !== null) {
          string += curr.node.id;
          if (curr.next !== null) {
            string += ', ';
          }
          curr = curr.next;
        }
        string += '}';
        string += `(${this.size()})`;
        return string;
      }

      freeMemory() {
        if (this.elements <= 1) {
          return;
        }

        while (this.numPoints > Potree.pointLoadLimit) {
          const element = this.first;
          const node = element.node;
          this.disposeDescendants(node);
        }
      }

      disposeDescendants(node) {
        const stack = [];
        stack.push(node);
        while (stack.length > 0) {
          const current = stack.pop();

          // console.log(current);

          current.dispose();
          this.remove(current);

          for (const key in current.children) {
            if (current.children.hasOwnProperty(key)) {
              const child = current.children[key];
              if (child.loaded) {
                stack.push(current.children[key]);
              }
            }
          }
        }
      }
    }

    PointCloudGreyhoundGeometryNode.IDCount = 0;

    PointCloudOctreeGeometryNode.IDCount = 0;


    function updatePointClouds(pointclouds, camera, renderer) {
      for (const pointcloud of pointclouds) {
        const start = performance.now();

        for (const profileRequest of pointcloud.profileRequests) {
          profileRequest.update();

          const duration = performance.now() - start;
          if (duration > 5) {
            break;
          }
        }

        const duration = performance.now() - start;
      }

      const result = updateVisibility(pointclouds, camera, renderer);

      for (const pointcloud of pointclouds) {
        pointcloud.updateMaterial(pointcloud.material, pointcloud.visibleNodes, camera, renderer);
        pointcloud.updateVisibleBounds();
      }

      exports.lru.freeMemory();

      return result;
    }


    function updateVisibilityStructures(pointclouds, camera, renderer) {
      const frustums = [];
      const camObjPositions = [];
      const priorityQueue = new BinaryHeap((x => 1 / x.weight));

      for (let i = 0; i < pointclouds.length; i++) {
        const pointcloud = pointclouds[i];

        if (!pointcloud.initialized()) {
          continue;
        }

        pointcloud.numVisibleNodes = 0;
        pointcloud.numVisiblePoints = 0;
        pointcloud.deepestVisibleLevel = 0;
        pointcloud.visibleNodes = [];
        pointcloud.visibleGeometry = [];

        // frustum in object space
        camera.updateMatrixWorld();
        const frustum = new THREE.Frustum();
        const viewI = camera.matrixWorldInverse;
        const world = pointcloud.matrixWorld;

        // use close near plane for frustum intersection
        const frustumCam = camera.clone();
        frustumCam.near = Math.min(camera.near, 0.1);
        frustumCam.updateProjectionMatrix();
        const proj = camera.projectionMatrix;

        const fm = new THREE.Matrix4().multiply(proj).multiply(viewI).multiply(world);
        frustum.setFromMatrix(fm);
        frustums.push(frustum);

        // camera position in object space
        const view = camera.matrixWorld;
        const worldI = new THREE.Matrix4().getInverse(world);
        const camMatrixObject = new THREE.Matrix4().multiply(worldI).multiply(view);
        const camObjPos = new THREE.Vector3().setFromMatrixPosition(camMatrixObject);
        camObjPositions.push(camObjPos);

        if (pointcloud.visible && pointcloud.root !== null) {
          priorityQueue.push({ pointcloud: i, node: pointcloud.root, weight: Number.MAX_VALUE });
        }

        // hide all previously visible nodes
        // if(pointcloud.root instanceof PointCloudOctreeNode){
        //	pointcloud.hideDescendants(pointcloud.root.sceneNode);
        // }
        if (pointcloud.root.isTreeNode()) {
          pointcloud.hideDescendants(pointcloud.root.sceneNode);
        }

        for (let j = 0; j < pointcloud.boundingBoxNodes.length; j++) {
          pointcloud.boundingBoxNodes[j].visible = false;
        }
      }

      return {
        frustums,
        camObjPositions,
        priorityQueue,
      };
    }


    function updateVisibility(pointclouds, camera, renderer) {
      const numVisibleNodes = 0;
      let numVisiblePoints = 0;

      const numVisiblePointsInPointclouds = new Map(pointclouds.map(pc => [pc, 0]));

      const visibleNodes = [];
      const visibleGeometry = [];
      const unloadedGeometry = [];

      let lowestSpacing = Infinity;

      // calculate object space frustum and cam pos and setup priority queue
      const s = updateVisibilityStructures(pointclouds, camera, renderer);
      const frustums = s.frustums;
      const camObjPositions = s.camObjPositions;
      const priorityQueue = s.priorityQueue;

      let loadedToGPUThisFrame = 0;

      const domWidth = renderer.domElement.clientWidth;
      const domHeight = renderer.domElement.clientHeight;

      // check if pointcloud has been transformed
      // some code will only be executed if changes have been detected
      if (!Potree._pointcloudTransformVersion) {
        Potree._pointcloudTransformVersion = new Map();
      }
      const pointcloudTransformVersion = Potree._pointcloudTransformVersion;
      for (const pointcloud of pointclouds) {
        if (!pointcloud.visible) {
          continue;
        }

        pointcloud.updateMatrixWorld();

        if (!pointcloudTransformVersion.has(pointcloud)) {
          pointcloudTransformVersion.set(pointcloud, { number: 0, transform: pointcloud.matrixWorld.clone() });
        } else {
          const version = pointcloudTransformVersion.get(pointcloud);

          if (!version.transform.equals(pointcloud.matrixWorld)) {
            version.number++;
            version.transform.copy(pointcloud.matrixWorld);

            pointcloud.dispatchEvent({
              type: 'transformation_changed',
              target: pointcloud,
            });
          }
        }
      }

      while (priorityQueue.size() > 0) {
        const element = priorityQueue.pop();
        let node = element.node;
        const parent = element.parent;
        const pointcloud = pointclouds[element.pointcloud];

        // { // restrict to certain nodes for debugging
        //	let allowedNodes = ["r", "r0", "r4"];
        //	if(!allowedNodes.includes(node.name)){
        //		continue;
        //	}
        // }

        const box = node.getBoundingBox();
        const frustum = frustums[element.pointcloud];
        const camObjPos = camObjPositions[element.pointcloud];

        const insideFrustum = frustum.intersectsBox(box);
        const maxLevel = pointcloud.maxLevel || Infinity;
        const level = node.getLevel();
        let visible = insideFrustum;
        visible = visible && !(numVisiblePoints + node.getNumPoints() > Potree.pointBudget);
        visible = visible && !(numVisiblePointsInPointclouds.get(pointcloud) + node.getNumPoints() > pointcloud.pointBudget);
        visible = visible && level < maxLevel;
        // visible = visible && node.name !== "r613";


        if (!window.warned125) {
          console.log('TODO');
          window.warned125 = true;
        }

        const clipBoxes = pointcloud.material.clipBoxes;
        if (true && clipBoxes.length > 0) {
          // node.debug = false;

          let numIntersecting = 0;
          let numIntersectionVolumes = 0;

          // if(node.name === "r60"){
          //	var a = 10;
          // }

          for (const clipBox of clipBoxes) {
            const pcWorldInverse = new THREE.Matrix4().getInverse(pointcloud.matrixWorld);
            const toPCObject = pcWorldInverse.multiply(clipBox.box.matrixWorld);

            const px = new THREE.Vector3(+0.5, 0, 0).applyMatrix4(pcWorldInverse);
            const nx = new THREE.Vector3(-0.5, 0, 0).applyMatrix4(pcWorldInverse);
            const py = new THREE.Vector3(0, +0.5, 0).applyMatrix4(pcWorldInverse);
            const ny = new THREE.Vector3(0, -0.5, 0).applyMatrix4(pcWorldInverse);
            const pz = new THREE.Vector3(0, 0, +0.5).applyMatrix4(pcWorldInverse);
            const nz = new THREE.Vector3(0, 0, -0.5).applyMatrix4(pcWorldInverse);

            const pxN = new THREE.Vector3().subVectors(nx, px).normalize();
            const nxN = pxN.clone().multiplyScalar(-1);
            const pyN = new THREE.Vector3().subVectors(ny, py).normalize();
            const nyN = pyN.clone().multiplyScalar(-1);
            const pzN = new THREE.Vector3().subVectors(nz, pz).normalize();
            const nzN = pzN.clone().multiplyScalar(-1);

            const pxPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(pxN, px);
            const nxPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(nxN, nx);
            const pyPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(pyN, py);
            const nyPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(nyN, ny);
            const pzPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(pzN, pz);
            const nzPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(nzN, nz);

            // if(window.debugdraw !== undefined && window.debugdraw === true && node.name === "r60"){

            //	Potree.utils.debugPlane(viewer.scene.scene, pxPlane, 1, 0xFF0000);
            //	Potree.utils.debugPlane(viewer.scene.scene, nxPlane, 1, 0x990000);
            //	Potree.utils.debugPlane(viewer.scene.scene, pyPlane, 1, 0x00FF00);
            //	Potree.utils.debugPlane(viewer.scene.scene, nyPlane, 1, 0x009900);
            //	Potree.utils.debugPlane(viewer.scene.scene, pzPlane, 1, 0x0000FF);
            //	Potree.utils.debugPlane(viewer.scene.scene, nzPlane, 1, 0x000099);

            //	Potree.utils.debugBox(viewer.scene.scene, box, new THREE.Matrix4(), 0x00FF00);
            //	Potree.utils.debugBox(viewer.scene.scene, box, pointcloud.matrixWorld, 0xFF0000);
            //	Potree.utils.debugBox(viewer.scene.scene, clipBox.box.boundingBox, clipBox.box.matrixWorld, 0xFF0000);

            //	window.debugdraw = false;
            // }

            const frustum = new THREE.Frustum(pxPlane, nxPlane, pyPlane, nyPlane, pzPlane, nzPlane);
            const intersects = frustum.intersectsBox(box);

            if (intersects) {
              numIntersecting++;
            }
            numIntersectionVolumes++;
          }

          const insideAny = numIntersecting > 0;
          const insideAll = numIntersecting === numIntersectionVolumes;

          if (pointcloud.material.clipTask === ClipTask.SHOW_INSIDE) {
            if (pointcloud.material.clipMethod === ClipMethod.INSIDE_ANY && insideAny) {
              // node.debug = true
            } else if (pointcloud.material.clipMethod === ClipMethod.INSIDE_ALL && insideAll) {
              // node.debug = true;
            } else {
              visible = false;
            }
          } else if (pointcloud.material.clipTask === ClipTask.SHOW_OUTSIDE) {
            // if(pointcloud.material.clipMethod === ClipMethod.INSIDE_ANY && !insideAny){
            //	//visible = true;
            //	let a = 10;
            // }else if(pointcloud.material.clipMethod === ClipMethod.INSIDE_ALL && !insideAll){
            //	//visible = true;
            //	let a = 20;
            // }else{
            //	visible = false;
            // }
          }
        }

        // visible = ["r", "r0", "r06", "r060"].includes(node.name);
        // visible = ["r"].includes(node.name);

        if (node.spacing) {
          lowestSpacing = Math.min(lowestSpacing, node.spacing);
        } else if (node.geometryNode && node.geometryNode.spacing) {
          lowestSpacing = Math.min(lowestSpacing, node.geometryNode.spacing);
        }

        if (numVisiblePoints + node.getNumPoints() > Potree.pointBudget) {
          break;
        }

        if (!visible) {
          continue;
        }

        // TODO: not used, same as the declaration?
        // numVisibleNodes++;
        numVisiblePoints += node.getNumPoints();
        const numVisiblePointsInPointcloud = numVisiblePointsInPointclouds.get(pointcloud);
        numVisiblePointsInPointclouds.set(pointcloud, numVisiblePointsInPointcloud + node.getNumPoints());

        pointcloud.numVisibleNodes++;
        pointcloud.numVisiblePoints += node.getNumPoints();

        if (node.isGeometryNode() && (!parent || parent.isTreeNode())) {
          if (node.isLoaded() && loadedToGPUThisFrame < 2) {
            node = pointcloud.toTreeNode(node, parent);
            loadedToGPUThisFrame++;
          } else {
            unloadedGeometry.push(node);
            visibleGeometry.push(node);
          }
        }

        if (node.isTreeNode()) {
          exports.lru.touch(node.geometryNode);
          node.sceneNode.visible = true;
          node.sceneNode.material = pointcloud.material;

          visibleNodes.push(node);
          pointcloud.visibleNodes.push(node);

          if (node._transformVersion === undefined) {
            node._transformVersion = -1;
          }
          const transformVersion = pointcloudTransformVersion.get(pointcloud);
          if (node._transformVersion !== transformVersion.number) {
            node.sceneNode.updateMatrix();
            node.sceneNode.matrixWorld.multiplyMatrices(pointcloud.matrixWorld, node.sceneNode.matrix);
            node._transformVersion = transformVersion.number;
          }

          if (pointcloud.showBoundingBox && !node.boundingBoxNode && node.getBoundingBox) {
            const boxHelper = new Box3Helper(node.getBoundingBox());
            boxHelper.matrixAutoUpdate = false;
            pointcloud.boundingBoxNodes.push(boxHelper);
            node.boundingBoxNode = boxHelper;
            node.boundingBoxNode.matrix.copy(pointcloud.matrixWorld);
          } else if (pointcloud.showBoundingBox) {
            node.boundingBoxNode.visible = true;
            node.boundingBoxNode.matrix.copy(pointcloud.matrixWorld);
          } else if (!pointcloud.showBoundingBox && node.boundingBoxNode) {
            node.boundingBoxNode.visible = false;
          }
        }

        // add child nodes to priorityQueue
        const children = node.getChildren();
        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          let weight = 0;
          if (camera.isPerspectiveCamera) {
            const sphere = child.getBoundingSphere();
            const center = sphere.center;
            // let distance = sphere.center.distanceTo(camObjPos);

            const dx = camObjPos.x - center.x;
            const dy = camObjPos.y - center.y;
            const dz = camObjPos.z - center.z;

            const dd = dx * dx + dy * dy + dz * dz;
            const distance = Math.sqrt(dd);


            const radius = sphere.radius;

            const fov = (camera.fov * Math.PI) / 180;
            const slope = Math.tan(fov / 2);
            const projFactor = (0.5 * domHeight) / (slope * distance);
            const screenPixelRadius = radius * projFactor;

            if (screenPixelRadius < pointcloud.minimumNodePixelSize) {
              continue;
            }

            weight = screenPixelRadius;

            if (distance - radius < 0) {
              weight = Number.MAX_VALUE;
            }
          } else {
            // TODO ortho visibility
            const bb = child.getBoundingBox();
            const distance = child.getBoundingSphere().center.distanceTo(camObjPos);
            const diagonal = bb.max.clone().sub(bb.min).length();
            weight = diagonal / distance;
          }

          priorityQueue.push({ pointcloud: element.pointcloud, node: child, parent: node, weight });
        }
      }// end priority queue loop

      { // update DEM
        const maxDEMLevel = 4;
        const candidates = pointclouds
          .filter(p => (p.generateDEM && p.dem instanceof Potree.DEM));
        for (const pointcloud of candidates) {
          const updatingNodes = pointcloud.visibleNodes.filter(n => n.getLevel() <= maxDEMLevel);
          pointcloud.dem.update(updatingNodes);
        }
      }

      for (let i = 0; i < Math.min(Potree.maxNodesLoading, unloadedGeometry.length); i++) {
        unloadedGeometry[i].load();
      }

      return {
        visibleNodes,
        numVisiblePoints,
        lowestSpacing,
      };
    }


    class Renderer {
      constructor(threeRenderer) {
        this.threeRenderer = threeRenderer;
        this.gl = this.threeRenderer.context;

        this.buffers = new Map();
        this.shaders = new Map();
        this.textures = new Map();

        this.glTypeMapping = new Map();
        this.glTypeMapping.set(Float32Array, this.gl.FLOAT);
        this.glTypeMapping.set(Uint8Array, this.gl.UNSIGNED_BYTE);
        this.glTypeMapping.set(Uint16Array, this.gl.UNSIGNED_SHORT);

        this.toggle = 0;
      }

      createBuffer(geometry) {
        const gl = this.gl;
        const webglBuffer = new WebGLBuffer();
        webglBuffer.vao = gl.createVertexArray();
        webglBuffer.numElements = geometry.attributes.position.count;

        gl.bindVertexArray(webglBuffer.vao);

        for (const attributeName in geometry.attributes) {
          const bufferAttribute = geometry.attributes[attributeName];

          const vbo = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
          gl.bufferData(gl.ARRAY_BUFFER, bufferAttribute.array, gl.STATIC_DRAW);

          const attributeLocation = attributeLocations[attributeName];
          const normalized = bufferAttribute.normalized;
          const type = this.glTypeMapping.get(bufferAttribute.array.constructor);

          gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
          gl.enableVertexAttribArray(attributeLocation);

          webglBuffer.vbos.set(attributeName, {
            handle: vbo,
            name: attributeName,
            count: bufferAttribute.count,
            itemSize: bufferAttribute.itemSize,
            type: geometry.attributes.position.array.constructor,
            version: 0,
          });
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        return webglBuffer;
      }

      updateBuffer(geometry) {
        const gl = this.gl;

        const webglBuffer = this.buffers.get(geometry);

        gl.bindVertexArray(webglBuffer.vao);

        for (const attributeName in geometry.attributes) {
          const bufferAttribute = geometry.attributes[attributeName];

          const attributeLocation = attributeLocations[attributeName];
          const normalized = bufferAttribute.normalized;
          const type = this.glTypeMapping.get(bufferAttribute.array.constructor);

          let vbo = null;
          if (!webglBuffer.vbos.has(attributeName)) {
            vbo = gl.createBuffer();

            webglBuffer.vbos.set(attributeName, {
              handle: vbo,
              name: attributeName,
              count: bufferAttribute.count,
              itemSize: bufferAttribute.itemSize,
              type: geometry.attributes.position.array.constructor,
              version: bufferAttribute.version,
            });
          } else {
            vbo = webglBuffer.vbos.get(attributeName).handle;
            webglBuffer.vbos.get(attributeName).version = bufferAttribute.version;
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
          gl.bufferData(gl.ARRAY_BUFFER, bufferAttribute.array, gl.STATIC_DRAW);
          gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
          gl.enableVertexAttribArray(attributeLocation);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
      }

      traverse(scene) {
        const octrees = [];

        const stack = [scene];
        while (stack.length > 0) {
          const node = stack.pop();

          if (node instanceof PointCloudTree) {
            octrees.push(node);
            continue;
          }

          const visibleChildren = node.children.filter(c => c.visible);
          stack.push(...visibleChildren);
        }

        const result = {
          octrees,
        };

        return result;
      }


      renderNodes(octree, nodes, visibilityTextureData, camera, target, shader, params) {
        if (exports.measureTimings) performance.mark('renderNodes-start');

        const gl = this.gl;

        const material = params.material ? params.material : octree.material;
        const shadowMaps = params.shadowMaps == null ? [] : params.shadowMaps;
        const view = camera.matrixWorldInverse;
        const worldView = new THREE.Matrix4();

        const mat4holder = new Float32Array(16);

        let i = 0;
        for (const node of nodes) {
          if (exports.debug.allowedNodes !== undefined) {
            if (!exports.debug.allowedNodes.includes(node.name)) {
              continue;
            }
          }

          // if(![
          //	"r42006420226",
          //	]
          //	.includes(node.name)){
          //	continue;
          // }

          const world = node.sceneNode.matrixWorld;
          worldView.multiplyMatrices(view, world);
          // this.multiplyViewWithScaleTrans(view, world, worldView);

          if (visibilityTextureData) {
            const vnStart = visibilityTextureData.offsets.get(node);
            shader.setUniform1f('uVNStart', vnStart);
          }


          const level = node.getLevel();

          if (node.debug) {
            shader.setUniform('uDebug', true);
          } else {
            shader.setUniform('uDebug', false);
          }

          let isLeaf;
          if (node instanceof PointCloudOctreeNode) {
            isLeaf = Object.keys(node.children).length === 0;
          } else if (node instanceof PointCloudArena4DNode) {
            isLeaf = node.geometryNode.isLeaf;
          }
          shader.setUniform('uIsLeafNode', isLeaf);


          // TODO consider passing matrices in an array to avoid uniformMatrix4fv overhead
          const lModel = shader.uniformLocations.modelMatrix;
          if (lModel) {
            mat4holder.set(world.elements);
            gl.uniformMatrix4fv(lModel, false, mat4holder);
          }

          const lModelView = shader.uniformLocations.modelViewMatrix;
          // mat4holder.set(worldView.elements);
          // faster then set in chrome 63
          for (let j = 0; j < 16; j++) {
            mat4holder[j] = worldView.elements[j];
          }
          gl.uniformMatrix4fv(lModelView, false, mat4holder);

          { // Clip Polygons
            if (material.clipPolygons && material.clipPolygons.length > 0) {
              const clipPolygonVCount = [];
              const worldViewProjMatrices = [];

              for (const clipPolygon of material.clipPolygons) {
                const view = clipPolygon.viewMatrix;
                const proj = clipPolygon.projMatrix;

                const worldViewProj = proj.clone().multiply(view).multiply(world);

                clipPolygonVCount.push(clipPolygon.markers.length);
                worldViewProjMatrices.push(worldViewProj);
              }

              const flattenedMatrices = [].concat(...worldViewProjMatrices.map(m => m.elements));

              const flattenedVertices = new Array(8 * 3 * material.clipPolygons.length);
              for (let i = 0; i < material.clipPolygons.length; i++) {
                const clipPolygon = material.clipPolygons[i];
                for (let j = 0; j < clipPolygon.markers.length; j++) {
                  flattenedVertices[i * 24 + (j * 3 + 0)] = clipPolygon.markers[j].position.x;
                  flattenedVertices[i * 24 + (j * 3 + 1)] = clipPolygon.markers[j].position.y;
                  flattenedVertices[i * 24 + (j * 3 + 2)] = clipPolygon.markers[j].position.z;
                }
              }

              const lClipPolygonVCount = shader.uniformLocations['uClipPolygonVCount[0]'];
              gl.uniform1iv(lClipPolygonVCount, clipPolygonVCount);

              const lClipPolygonVP = shader.uniformLocations['uClipPolygonWVP[0]'];
              gl.uniformMatrix4fv(lClipPolygonVP, false, flattenedMatrices);

              const lClipPolygons = shader.uniformLocations['uClipPolygonVertices[0]'];
              gl.uniform3fv(lClipPolygons, flattenedVertices);
            }
          }


          // shader.setUniformMatrix4("modelMatrix", world);
          // shader.setUniformMatrix4("modelViewMatrix", worldView);
          shader.setUniform1f('uLevel', level);
          shader.setUniform1f('uNodeSpacing', node.geometryNode.estimatedSpacing);

          shader.setUniform1f('uPCIndex', i);
          // uBBSize

          if (shadowMaps.length > 0) {
            const lShadowMap = shader.uniformLocations['uShadowMap[0]'];

            shader.setUniform3f('uShadowColor', material.uniforms.uShadowColor.value);

            const bindingStart = 5;
            const bindingPoints = new Array(shadowMaps.length).fill(bindingStart).map((a, i) => (a + i));
            gl.uniform1iv(lShadowMap, bindingPoints);

            for (let i = 0; i < shadowMaps.length; i++) {
              const shadowMap = shadowMaps[i];
              const bindingPoint = bindingPoints[i];
              const glTexture = this.threeRenderer.properties.get(shadowMap.target.texture).__webglTexture;

              gl.activeTexture(gl[`TEXTURE${bindingPoint}`]);
              gl.bindTexture(gl.TEXTURE_2D, glTexture);
            }

            {
              const worldViewMatrices = shadowMaps
                .map(sm => sm.camera.matrixWorldInverse)
                .map(view => new THREE.Matrix4().multiplyMatrices(view, world));

              const flattenedMatrices = [].concat(...worldViewMatrices.map(c => c.elements));
              const lWorldView = shader.uniformLocations['uShadowWorldView[0]'];
              gl.uniformMatrix4fv(lWorldView, false, flattenedMatrices);
            }

            {
              const flattenedMatrices = [].concat(...shadowMaps.map(sm => sm.camera.projectionMatrix.elements));
              const lProj = shader.uniformLocations['uShadowProj[0]'];
              gl.uniformMatrix4fv(lProj, false, flattenedMatrices);
            }
          }

          const geometry = node.geometryNode.geometry;

          let webglBuffer = null;
          if (!this.buffers.has(geometry)) {
            webglBuffer = this.createBuffer(geometry);
            this.buffers.set(geometry, webglBuffer);
          } else {
            webglBuffer = this.buffers.get(geometry);
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName];

              if (attribute.version > webglBuffer.vbos.get(attributeName).version) {
                this.updateBuffer(geometry);
              }
            }
          }

          gl.bindVertexArray(webglBuffer.vao);

          const numPoints = webglBuffer.numElements;
          gl.drawArrays(gl.POINTS, 0, numPoints);

          i++;
        }

        gl.bindVertexArray(null);

        if (exports.measureTimings) {
          performance.mark('renderNodes-end');
          performance.measure('render.renderNodes', 'renderNodes-start', 'renderNodes-end');
        }
      }

      renderOctree(octree, nodes, camera, target, params = {}) {
        const gl = this.gl;

        const material = params.material ? params.material : octree.material;
        const shadowMaps = params.shadowMaps == null ? [] : params.shadowMaps;
        const view = camera.matrixWorldInverse;
        const viewInv = camera.matrixWorld;
        const proj = camera.projectionMatrix;
        const projInv = new THREE.Matrix4().getInverse(proj);
        // const worldView = new THREE.Matrix4();

        let shader = null;
        let visibilityTextureData = null;

        let currentTextureBindingPoint = 0;

        if (material.pointSizeType >= 0) {
          if (material.pointSizeType === PointSizeType.ADAPTIVE ||
        material.pointColorType === PointColorType.LOD) {
            const vnNodes = (params.vnTextureNodes != null) ? params.vnTextureNodes : nodes;
            visibilityTextureData = octree.computeVisibilityTextureData(vnNodes, camera);

            const vnt = material.visibleNodesTexture;
            const data = vnt.image.data;
            data.set(visibilityTextureData.data);
            vnt.needsUpdate = true;
          }
        }

        { // UPDATE SHADER AND TEXTURES
          if (!this.shaders.has(material)) {
            const [vs, fs] = [material.vertexShader, material.fragmentShader];
            const shader = new Shader(gl, 'pointcloud', vs, fs);

            this.shaders.set(material, shader);
          }

          shader = this.shaders.get(material);

          // if(material.needsUpdate){
          {
            let [vs, fs] = [material.vertexShader, material.fragmentShader];

            const numSnapshots = material.snapEnabled ? material.numSnapshots : 0;
            const numClipBoxes = (material.clipBoxes && material.clipBoxes.length) ? material.clipBoxes.length : 0;
            // let numClipSpheres = (material.clipSpheres && material.clipSpheres.length) ? material.clipSpheres.length : 0;
            const numClipSpheres = (params.clipSpheres && params.clipSpheres.length) ? params.clipSpheres.length : 0;
            const numClipPolygons = (material.clipPolygons && material.clipPolygons.length) ? material.clipPolygons.length : 0;
            const defines = [
              `#define num_shadowmaps ${shadowMaps.length}`,
              `#define num_snapshots ${numSnapshots}`,
              `#define num_clipboxes ${numClipBoxes}`,
              `#define num_clipspheres ${numClipSpheres}`,
              `#define num_clippolygons ${numClipPolygons}`,
            ];

            // vs = `#define num_shadowmaps ${shadowMaps.length}\n` + vs;
            // fs = `#define num_shadowmaps ${shadowMaps.length}\n` + fs;

            const definesString = defines.join('\n');

            vs = `${definesString}\n${vs}`;
            fs = `${definesString}\n${fs}`;

            shader.update(vs, fs);

            material.needsUpdate = false;
          }

          for (const uniformName of Object.keys(material.uniforms)) {
            const uniform = material.uniforms[uniformName];

            if (uniform.type === 't') {
              const texture = uniform.value;

              if (!texture) {
                continue;
              }

              if (!this.textures.has(texture)) {
                const webglTexture = new WebGLTexture(gl, texture);

                this.textures.set(texture, webglTexture);
              }

              const webGLTexture = this.textures.get(texture);
              webGLTexture.update();
            }
          }
        }

        gl.useProgram(shader.program);

        let transparent = false;
        if (params.transparent !== undefined) {
          transparent = params.transparent && material.opacity < 1;
        } else {
          transparent = material.opacity < 1;
        }

        if (transparent) {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.depthMask(false);
          gl.disable(gl.DEPTH_TEST);
        } else {
          gl.disable(gl.BLEND);
          gl.depthMask(true);
          gl.enable(gl.DEPTH_TEST);
        }

        if (params.blendFunc !== undefined) {
          gl.enable(gl.BLEND);
          gl.blendFunc(...params.blendFunc);
        }

        if (params.depthTest !== undefined) {
          if (params.depthTest === true) {
            gl.enable(gl.DEPTH_TEST);
          } else {
            gl.disable(gl.DEPTH_TEST);
          }
        }

        if (params.depthWrite !== undefined) {
          if (params.depthWrite === true) {
            gl.depthMask(true);
          } else {
            gl.depthMask(false);
          }
        }


        { // UPDATE UNIFORMS
          shader.setUniformMatrix4('projectionMatrix', proj);
          shader.setUniformMatrix4('viewMatrix', view);
          shader.setUniformMatrix4('uViewInv', viewInv);
          shader.setUniformMatrix4('uProjInv', projInv);

          const screenWidth = target ? target.width : material.screenWidth;
          const screenHeight = target ? target.height : material.screenHeight;

          shader.setUniform1f('uScreenWidth', screenWidth);
          shader.setUniform1f('uScreenHeight', screenHeight);
          shader.setUniform1f('fov', Math.PI * camera.fov / 180);
          shader.setUniform1f('near', camera.near);
          shader.setUniform1f('far', camera.far);

          if (camera instanceof THREE.OrthographicCamera) {
            shader.setUniform('uUseOrthographicCamera', true);
            shader.setUniform('uOrthoWidth', camera.right - camera.left);
            shader.setUniform('uOrthoHeight', camera.top - camera.bottom);
          } else {
            shader.setUniform('uUseOrthographicCamera', false);
          }

          if (material.clipBoxes.length + material.clipPolygons.length === 0) {
            shader.setUniform1i('clipTask', ClipTask.NONE);
          } else {
            shader.setUniform1i('clipTask', material.clipTask);
          }

          shader.setUniform1i('clipMethod', material.clipMethod);

          if (material.clipBoxes && material.clipBoxes.length > 0) {
            // let flattenedMatrices = [].concat(...material.clipBoxes.map(c => c.inverse.elements));

            // const lClipBoxes = shader.uniformLocations["clipBoxes[0]"];
            // gl.uniformMatrix4fv(lClipBoxes, false, flattenedMatrices);

            const lClipBoxes = shader.uniformLocations['clipBoxes[0]'];
            gl.uniformMatrix4fv(lClipBoxes, false, material.uniforms.clipBoxes.value);
          }

          // TODO CLIPSPHERES
          if (params.clipSpheres && params.clipSpheres.length > 0) {
            const clipSpheres = params.clipSpheres;

            const matrices = [];
            for (const clipSphere of clipSpheres) {
              // let mScale = new THREE.Matrix4().makeScale(...clipSphere.scale.toArray());
              // let mTranslate = new THREE.Matrix4().makeTranslation(...clipSphere.position.toArray());

              // let clipToWorld = new THREE.Matrix4().multiplyMatrices(mTranslate, mScale);
              const clipToWorld = clipSphere.matrixWorld;
              const viewToWorld = camera.matrixWorld;
              const worldToClip = new THREE.Matrix4().getInverse(clipToWorld);

              const viewToClip = new THREE.Matrix4().multiplyMatrices(worldToClip, viewToWorld);

              matrices.push(viewToClip);
            }

            const flattenedMatrices = [].concat(...matrices.map(matrix => matrix.elements));

            const lClipSpheres = shader.uniformLocations['uClipSpheres[0]'];
            gl.uniformMatrix4fv(lClipSpheres, false, flattenedMatrices);

            // const lClipSpheres = shader.uniformLocations["uClipSpheres[0]"];
            // gl.uniformMatrix4fv(lClipSpheres, false, material.uniforms.clipSpheres.value);
          }

          shader.setUniform1f('size', material.size);
          shader.setUniform1f('maxSize', material.uniforms.maxSize.value);
          shader.setUniform1f('minSize', material.uniforms.minSize.value);

          // uniform float uPCIndex
          shader.setUniform1f('uOctreeSpacing', material.spacing);
          shader.setUniform('uOctreeSize', material.uniforms.octreeSize.value);


          // uniform vec3 uColor;
          shader.setUniform3f('uColor', material.color.toArray());
          // uniform float opacity;
          shader.setUniform1f('uOpacity', material.opacity);

          shader.setUniform2f('elevationRange', material.elevationRange);
          shader.setUniform2f('intensityRange', material.intensityRange);
          // uniform float intensityGamma;
          // uniform float intensityContrast;
          // uniform float intensityBrightness;
          shader.setUniform1f('intensityGamma', material.intensityGamma);
          shader.setUniform1f('intensityContrast', material.intensityContrast);
          shader.setUniform1f('intensityBrightness', material.intensityBrightness);

          shader.setUniform1f('rgbGamma', material.rgbGamma);
          shader.setUniform1f('rgbContrast', material.rgbContrast);
          shader.setUniform1f('rgbBrightness', material.rgbBrightness);
          shader.setUniform1f('uTransition', material.transition);
          shader.setUniform1f('wRGB', material.weightRGB);
          shader.setUniform1f('wIntensity', material.weightIntensity);
          shader.setUniform1f('wElevation', material.weightElevation);
          shader.setUniform1f('wClassification', material.weightClassification);
          shader.setUniform1f('wReturnNumber', material.weightReturnNumber);
          shader.setUniform1f('wSourceID', material.weightSourceID);

          const vnWebGLTexture = this.textures.get(material.visibleNodesTexture);
          shader.setUniform1i('visibleNodesTexture', currentTextureBindingPoint);
          gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
          gl.bindTexture(vnWebGLTexture.target, vnWebGLTexture.id);
          currentTextureBindingPoint++;

          const gradientTexture = this.textures.get(material.gradientTexture);
          shader.setUniform1i('gradient', currentTextureBindingPoint);
          gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
          gl.bindTexture(gradientTexture.target, gradientTexture.id);
          currentTextureBindingPoint++;

          const classificationTexture = this.textures.get(material.classificationTexture);
          shader.setUniform1i('classificationLUT', currentTextureBindingPoint);
          gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
          gl.bindTexture(classificationTexture.target, classificationTexture.id);
          currentTextureBindingPoint++;


          if (material.snapEnabled === true) {
            {
              const lSnapshot = shader.uniformLocations['uSnapshot[0]'];
              const lSnapshotDepth = shader.uniformLocations['uSnapshotDepth[0]'];

              const bindingStart = currentTextureBindingPoint;
              const lSnapshotBindingPoints = new Array(5).fill(bindingStart).map((a, i) => (a + i));
              const lSnapshotDepthBindingPoints = new Array(5)
                .fill(1 + Math.max(...lSnapshotBindingPoints))
                .map((a, i) => (a + i));
              currentTextureBindingPoint = 1 + Math.max(...lSnapshotDepthBindingPoints);

              gl.uniform1iv(lSnapshot, lSnapshotBindingPoints);
              gl.uniform1iv(lSnapshotDepth, lSnapshotDepthBindingPoints);

              for (let i = 0; i < 5; i++) {
                const texture = material.uniforms.uSnapshot.value[i];
                const textureDepth = material.uniforms.uSnapshotDepth.value[i];

                if (!texture) {
                  break;
                }

                const snapTexture = this.threeRenderer.properties.get(texture).__webglTexture;
                const snapTextureDepth = this.threeRenderer.properties.get(textureDepth).__webglTexture;

                const bindingPoint = lSnapshotBindingPoints[i];
                const depthBindingPoint = lSnapshotDepthBindingPoints[i];

                gl.activeTexture(gl[`TEXTURE${bindingPoint}`]);
                gl.bindTexture(gl.TEXTURE_2D, snapTexture);

                gl.activeTexture(gl[`TEXTURE${depthBindingPoint}`]);
                gl.bindTexture(gl.TEXTURE_2D, snapTextureDepth);
              }
            }

            {
              const flattenedMatrices = [].concat(...material.uniforms.uSnapView.value.map(c => c.elements));
              const lSnapView = shader.uniformLocations['uSnapView[0]'];
              gl.uniformMatrix4fv(lSnapView, false, flattenedMatrices);
            }
            {
              const flattenedMatrices = [].concat(...material.uniforms.uSnapProj.value.map(c => c.elements));
              const lSnapProj = shader.uniformLocations['uSnapProj[0]'];
              gl.uniformMatrix4fv(lSnapProj, false, flattenedMatrices);
            }
            {
              const flattenedMatrices = [].concat(...material.uniforms.uSnapProjInv.value.map(c => c.elements));
              const lSnapProjInv = shader.uniformLocations['uSnapProjInv[0]'];
              gl.uniformMatrix4fv(lSnapProjInv, false, flattenedMatrices);
            }
            {
              const flattenedMatrices = [].concat(...material.uniforms.uSnapViewInv.value.map(c => c.elements));
              const lSnapViewInv = shader.uniformLocations['uSnapViewInv[0]'];
              gl.uniformMatrix4fv(lSnapViewInv, false, flattenedMatrices);
            }
          }
        }

        this.renderNodes(octree, nodes, visibilityTextureData, camera, target, shader, params);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0);
      }

      render(scene, camera, target = null, params = {}) {
        const gl = this.gl;

        // PREPARE
        if (target != null) {
          this.threeRenderer.setRenderTarget(target);
        }

        camera.updateProjectionMatrix();

        const traversalResult = this.traverse(scene);


        // RENDER
        for (const octree of traversalResult.octrees) {
          const nodes = octree.visibleNodes;
          this.renderOctree(octree, nodes, camera, target, params);
        }


        // CLEANUP
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.threeRenderer.state.reset();
      }
    }


    // Potree.workerPool = new Potree.WorkerPool();

    //
    // Algorithm by Christian Boucheny
    // shader code taken and adapted from CloudCompare
    //
    // see
    // https://github.com/cloudcompare/trunk/tree/master/plugins/qEDL/shaders/EDL
    // http://www.kitware.com/source/home/post/9
    // https://tel.archives-ouvertes.fr/tel-00438464/document p. 115+ (french)


    /**
       * laslaz code taken and adapted from plas.io js-laslaz
       *	http://plas.io/
       *  https://github.com/verma/plasio
       *
       * Thanks to Uday Verma and Howard Butler
       *
       */


    function toInterleavedBufferAttribute(pointAttribute) {
      let att = null;

      if (pointAttribute.name === PointAttribute.POSITION_CARTESIAN.name) {
        att = new Potree.InterleavedBufferAttribute('position', 12, 3, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.COLOR_PACKED.name) {
        att = new Potree.InterleavedBufferAttribute('color', 4, 4, 'UNSIGNED_BYTE', true);
      } else if (pointAttribute.name === PointAttribute.INTENSITY.name) {
        att = new Potree.InterleavedBufferAttribute('intensity', 4, 1, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.CLASSIFICATION.name) {
        att = new Potree.InterleavedBufferAttribute('classification', 4, 1, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.RETURN_NUMBER.name) {
        att = new Potree.InterleavedBufferAttribute('returnNumber', 4, 1, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.NUMBER_OF_RETURNS.name) {
        att = new Potree.InterleavedBufferAttribute('numberOfReturns', 4, 1, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.SOURCE_ID.name) {
        att = new Potree.InterleavedBufferAttribute('pointSourceID', 4, 1, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.NORMAL_SPHEREMAPPED.name) {
        att = new Potree.InterleavedBufferAttribute('normal', 12, 3, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.NORMAL_OCT16.name) {
        att = new Potree.InterleavedBufferAttribute('normal', 12, 3, 'FLOAT', false);
      } else if (pointAttribute.name === PointAttribute.NORMAL.name) {
        att = new Potree.InterleavedBufferAttribute('normal', 12, 3, 'FLOAT', false);
      }

      return att;
    }


    // http://epsg.io/
    proj4.defs('UTM10N', '+proj=utm +zone=10 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');


    ProfilePointCloudEntry.materialPool = new Set();






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




    class Sidebar {
      constructor(viewer) {
        this.viewer = viewer;

        this.measuringTool = new MeasuringTool(this.viewer);
        this.profileTool = new ProfileTool(this.viewer);
        this.volumeTool = new VolumeTool(this.viewer);
      }

      createToolIcon(icon, title, callback) {
        const element = $(`
      <img src="${icon}"
        style="width: 32px; height: 32px"
        class="button-icon"
        data-i18n="${title}" />
    `);

        element.click(callback);

        return element;
      }

      init() {
        this.initAccordion();
        this.initAppearance();
        this.initToolbar();
        this.initScene();
        this.initNavigation();
        this.initClassificationList();
        this.initClippingTool();
        this.initSettings();

        $('#potree_version_number').html(`${Potree.version.major}.${Potree.version.minor}${Potree.version.suffix}`);
        $('.perfect_scrollbar').perfectScrollbar();
      }


      initToolbar() {
        // ANGLE
        const elToolbar = $('#tools');
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/angle.png`,
          '[title]tt.angle_measurement',
          () => {
            $('#menu_measurements').next().slideDown();
            const measurement = this.measuringTool.startInsertion({
              showDistances: false,
              showAngles: true,
              showArea: false,
              closed: true,
              maxMarkers: 3,
              name: 'Angle',
            });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === measurement.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // POINT
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/point.svg`,
          '[title]tt.point_measurement',
          () => {
            $('#menu_measurements').next().slideDown();
            const measurement = this.measuringTool.startInsertion({
              showDistances: false,
              showAngles: false,
              showCoordinates: true,
              showArea: false,
              closed: true,
              maxMarkers: 1,
              name: 'Point',
            });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === measurement.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // DISTANCE
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/distance.svg`,
          '[title]tt.distance_measurement',
          () => {
            $('#menu_measurements').next().slideDown();
            const measurement = this.measuringTool.startInsertion({
              showDistances: true,
              showArea: false,
              closed: false,
              name: 'Distance',
            });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === measurement.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // HEIGHT
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/height.svg`,
          '[title]tt.height_measurement',
          () => {
            $('#menu_measurements').next().slideDown();
            const measurement = this.measuringTool.startInsertion({
              showDistances: false,
              showHeight: true,
              showArea: false,
              closed: false,
              maxMarkers: 2,
              name: 'Height',
            });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === measurement.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // AREA
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/area.svg`,
          '[title]tt.area_measurement',
          () => {
            $('#menu_measurements').next().slideDown();
            const measurement = this.measuringTool.startInsertion({
              showDistances: true,
              showArea: true,
              closed: true,
              name: 'Area',
            });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === measurement.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // VOLUME
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/volume.svg`,
          '[title]tt.volume_measurement',
          () => {
            const volume = this.volumeTool.startInsertion();

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === volume.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // SPHERE VOLUME
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/sphere_distances.svg`,
          '[title]tt.volume_measurement',
          () => {
            const volume = this.volumeTool.startInsertion({ type: SphereVolume });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === volume.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // PROFILE
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/profile.svg`,
          '[title]tt.height_profile',
          () => {
            $('#menu_measurements').next().slideDown();
            const profile = this.profileTool.startInsertion();

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === profile.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // REMOVE ALL
        elToolbar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/reset_tools.svg`,
          '[title]tt.remove_all_measurement',
          () => {
            this.viewer.scene.removeAllMeasurements();
          },
        ));
      }

      initScene() {
        const elScene = $('#menu_scene');
        const elObjects = elScene.next().find('#scene_objects');
        const elProperties = elScene.next().find('#scene_object_properties');


        {
          const elExport = elScene.next().find('#scene_export');

          const geoJSONIcon = `${Potree.resourcePath}/icons/file_geojson.svg`;
          const dxfIcon = `${Potree.resourcePath}/icons/file_dxf.svg`;

          elExport.append(`
        Export: <br>
        <a href="#" download="measure.json"><img name="geojson_export_button" src="${geoJSONIcon}" class="button-icon" style="height: 24px" /></a>
        <a href="#" download="measure.dxf"><img name="dxf_export_button" src="${dxfIcon}" class="button-icon" style="height: 24px" /></a>
      `);

          const elDownloadJSON = elExport.find('img[name=geojson_export_button]').parent();
          elDownloadJSON.click(() => {
            const scene = this.viewer.scene;
            const measurements = [...scene.measurements, ...scene.profiles, ...scene.volumes];

            const geoJson = GeoJSONExporter.toString(measurements);

            const url = window.URL.createObjectURL(new Blob([geoJson], { type: 'data:application/octet-stream' }));
            elDownloadJSON.attr('href', url);
          });

          const elDownloadDXF = elExport.find('img[name=dxf_export_button]').parent();
          elDownloadDXF.click(() => {
            const scene = this.viewer.scene;
            const measurements = [...scene.measurements, ...scene.profiles, ...scene.volumes];

            const dxf = DXFExporter.toString(measurements);

            const url = window.URL.createObjectURL(new Blob([dxf], { type: 'data:application/octet-stream' }));
            elDownloadDXF.attr('href', url);
          });
        }

        const propertiesPanel = new PropertiesPanel(elProperties, this.viewer);
        propertiesPanel.setScene(this.viewer.scene);

        localStorage.removeItem('jstree');

        const tree = $('<div id="jstree_scene"></div>');
        elObjects.append(tree);

        tree.jstree({
          plugins: ['checkbox', 'state'],
          core: {
            dblclick_toggle: false,
            state: {
              checked: true,
            },
            check_callback: true,
            expand_selected_onload: true,
          },
          checkbox: {
            keep_selected_style: true,
            three_state: false,
            whole_node: false,
            tie_selection: false,
          },
        });

        const createNode = (parent, text, icon, object) => {
          const nodeID = tree.jstree('create_node', parent, {
            text,
            icon,
            data: object,
          },
          'last', false, false);

          if (object.visible) {
            tree.jstree('check_node', nodeID);
          } else {
            tree.jstree('uncheck_node', nodeID);
          }

          return nodeID;
        };

        const pcID = tree.jstree('create_node', '#', { text: '<b>Point Clouds</b>', id: 'pointclouds' }, 'last', false, false);
        const measurementID = tree.jstree('create_node', '#', { text: '<b>Measurements</b>', id: 'measurements' }, 'last', false, false);
        const annotationsID = tree.jstree('create_node', '#', { text: '<b>Annotations</b>', id: 'annotations' }, 'last', false, false);
        const otherID = tree.jstree('create_node', '#', { text: '<b>Other</b>', id: 'other' }, 'last', false, false);

        tree.jstree('check_node', pcID);
        tree.jstree('check_node', measurementID);
        tree.jstree('check_node', annotationsID);
        tree.jstree('check_node', otherID);

        tree.on('create_node.jstree', (e, data) => {
          tree.jstree('open_all');
        });

        tree.on('select_node.jstree', (e, data) => {
          const object = data.node.data;
          propertiesPanel.set(object);

          this.viewer.inputHandler.deselectAll();

          if (object instanceof Volume) {
            this.viewer.inputHandler.toggleSelection(object);
          }

          $(this.viewer.renderer.domElement).focus();
        });

        tree.on('deselect_node.jstree', (e, data) => {
          propertiesPanel.set(null);
        });

        tree.on('delete_node.jstree', (e, data) => {
          propertiesPanel.set(null);
        });

        tree.on('dblclick', '.jstree-anchor', (e) => {
          const instance = $.jstree.reference(this);
          const node = instance.get_node(this);
          const object = node.data;

          // ignore double click on checkbox
          if (e.target.classList.contains('jstree-checkbox')) {
            return;
          }

          if (object instanceof PointCloudTree) {
            const box = this.viewer.getBoundingBox([object]);
            const node = new THREE.Object3D();
            node.boundingBox = box;
            this.viewer.zoomTo(node, 1, 500);
          } else if (object instanceof Measure) {
            const points = object.points.map(p => p.position);
            const box = new THREE.Box3().setFromPoints(points);
            if (box.getSize(new THREE.Vector3()).length() > 0) {
              const node = new THREE.Object3D();
              node.boundingBox = box;
              this.viewer.zoomTo(node, 2, 500);
            }
          } else if (object instanceof Profile) {
            const points = object.points;
            const box = new THREE.Box3().setFromPoints(points);
            if (box.getSize(new THREE.Vector3()).length() > 0) {
              const node = new THREE.Object3D();
              node.boundingBox = box;
              this.viewer.zoomTo(node, 1, 500);
            }
          } else if (object instanceof Volume) {
            const box = object.boundingBox.clone().applyMatrix4(object.matrixWorld);

            if (box.getSize(new THREE.Vector3()).length() > 0) {
              const node = new THREE.Object3D();
              node.boundingBox = box;
              this.viewer.zoomTo(node, 1, 500);
            }
          } else if (object instanceof Annotation) {
            object.moveHere(this.viewer.scene.getActiveCamera());
          } else if (object instanceof PolygonClipVolume) {
            const dir = object.camera.getWorldDirection(new THREE.Vector3());
            let target;

            if (object.camera instanceof THREE.OrthographicCamera) {
              dir.multiplyScalar(object.camera.right);
              target = new THREE.Vector3().addVectors(object.camera.position, dir);
              this.viewer.setCameraMode(CameraMode.ORTHOGRAPHIC);
            } else if (object.camera instanceof THREE.PerspectiveCamera) {
              dir.multiplyScalar(this.viewer.scene.view.radius);
              target = new THREE.Vector3().addVectors(object.camera.position, dir);
              this.viewer.setCameraMode(CameraMode.PERSPECTIVE);
            }

            this.viewer.scene.view.position.copy(object.camera.position);
            this.viewer.scene.view.lookAt(target);
          } else if (object instanceof THREE.SpotLight) {
            const distance = (object.distance > 0) ? object.distance / 4 : 5 * 1000;
            const position = object.position;
            const target = new THREE.Vector3().addVectors(
              position,
              object.getWorldDirection(new THREE.Vector3()).multiplyScalar(distance));

            this.viewer.scene.view.position.copy(object.position);
            this.viewer.scene.view.lookAt(target);
          } else if (object instanceof THREE.Object3D) {
            const box = new THREE.Box3().setFromObject(object);

            if (box.getSize(new THREE.Vector3()).length() > 0) {
              const node = new THREE.Object3D();
              node.boundingBox = box;
              this.viewer.zoomTo(node, 1, 500);
            }
          }
        });

        tree.on('uncheck_node.jstree', (e, data) => {
          const object = data.node.data;

          if (object) {
            object.visible = false;
          }
        });

        tree.on('check_node.jstree', (e, data) => {
          const object = data.node.data;

          if (object) {
            object.visible = true;
          }
        });


        const onPointCloudAdded = (e) => {
          const pointcloud = e.pointcloud;
          const cloudIcon = `${Potree.resourcePath}/icons/cloud.svg`;
          const node = createNode(pcID, pointcloud.name, cloudIcon, pointcloud);

          pointcloud.addEventListener('visibility_changed', () => {
            if (pointcloud.visible) {
              tree.jstree('check_node', node);
            } else {
              tree.jstree('uncheck_node', node);
            }
          });
        };

        const onMeasurementAdded = (e) => {
          const measurement = e.measurement;
          const icon = Utils.getMeasurementIcon(measurement);
          createNode(measurementID, measurement.name, icon, measurement);
        };

        const onVolumeAdded = (e) => {
          const volume = e.volume;
          const icon = Utils.getMeasurementIcon(volume);
          const node = createNode(measurementID, volume.name, icon, volume);

          volume.addEventListener('visibility_changed', () => {
            if (volume.visible) {
              tree.jstree('check_node', node);
            } else {
              tree.jstree('uncheck_node', node);
            }
          });
        };

        const onProfileAdded = (e) => {
          const profile = e.profile;
          const icon = Utils.getMeasurementIcon(profile);
          createNode(measurementID, profile.name, icon, profile);
        };

        const onAnnotationAdded = (e) => {
          const annotation = e.annotation;

          const annotationIcon = `${Potree.resourcePath}/icons/annotation.svg`;
          const parentID = this.annotationMapping.get(annotation.parent);
          const annotationID = createNode(parentID, annotation.title, annotationIcon, annotation);
          this.annotationMapping.set(annotation, annotationID);

          // let node = createNode(annotationsID, annotation.name, icon, volume);
          // oldScene.annotations.removeEventListener('annotation_added', this.onAnnotationAdded);
        };

        this.viewer.scene.addEventListener('pointcloud_added', onPointCloudAdded);
        this.viewer.scene.addEventListener('measurement_added', onMeasurementAdded);
        this.viewer.scene.addEventListener('profile_added', onProfileAdded);
        this.viewer.scene.addEventListener('volume_added', onVolumeAdded);
        this.viewer.scene.addEventListener('polygon_clip_volume_added', onVolumeAdded);
        this.viewer.scene.annotations.addEventListener('annotation_added', onAnnotationAdded);

        const onMeasurementRemoved = (e) => {
          const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
          const jsonNode = measurementsRoot.children.find(child => child.data.uuid === e.measurement.uuid);

          tree.jstree('delete_node', jsonNode.id);
        };

        const onVolumeRemoved = (e) => {
          const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
          const jsonNode = measurementsRoot.children.find(child => child.data.uuid === e.volume.uuid);

          tree.jstree('delete_node', jsonNode.id);
        };

        const onProfileRemoved = (e) => {
          const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
          const jsonNode = measurementsRoot.children.find(child => child.data.uuid === e.profile.uuid);

          tree.jstree('delete_node', jsonNode.id);
        };

        this.viewer.scene.addEventListener('measurement_removed', onMeasurementRemoved);
        this.viewer.scene.addEventListener('volume_removed', onVolumeRemoved);
        this.viewer.scene.addEventListener('profile_removed', onProfileRemoved);

        {
          const annotationIcon = `${Potree.resourcePath}/icons/annotation.svg`;
          this.annotationMapping = new Map();
          this.annotationMapping.set(this.viewer.scene.annotations, annotationsID);
          this.viewer.scene.annotations.traverseDescendants((annotation) => {
            const parentID = this.annotationMapping.get(annotation.parent);
            const annotationID = createNode(parentID, annotation.title, annotationIcon, annotation);
            this.annotationMapping.set(annotation, annotationID);
          });
        }

        for (const pointcloud of this.viewer.scene.pointclouds) {
          onPointCloudAdded({ pointcloud });
        }

        for (const measurement of this.viewer.scene.measurements) {
          onMeasurementAdded({ measurement });
        }

        for (const volume of [...this.viewer.scene.volumes, ...this.viewer.scene.polygonClipVolumes]) {
          onVolumeAdded({ volume });
        }


        for (const profile of this.viewer.scene.profiles) {
          onProfileAdded({ profile });
        }

        {
          createNode(otherID, 'Camera', null, new THREE.Camera());
        }

        this.viewer.addEventListener('scene_changed', (e) => {
          propertiesPanel.setScene(e.scene);

          e.oldScene.removeEventListener('pointcloud_added', onPointCloudAdded);
          e.oldScene.removeEventListener('measurement_added', onMeasurementAdded);
          e.oldScene.removeEventListener('profile_added', onProfileAdded);
          e.oldScene.removeEventListener('volume_added', onVolumeAdded);
          e.oldScene.removeEventListener('polygon_clip_volume_added', onVolumeAdded);
          e.oldScene.removeEventListener('measurement_removed', onMeasurementRemoved);

          e.scene.addEventListener('pointcloud_added', onPointCloudAdded);
          e.scene.addEventListener('measurement_added', onMeasurementAdded);
          e.scene.addEventListener('profile_added', onProfileAdded);
          e.scene.addEventListener('volume_added', onVolumeAdded);
          e.scene.addEventListener('polygon_clip_volume_added', onVolumeAdded);
          e.scene.addEventListener('measurement_removed', onMeasurementRemoved);
        });
      }

      initClippingTool() {
        this.viewer.addEventListener('cliptask_changed', (event) => {
          console.log('TODO');
        });

        this.viewer.addEventListener('clipmethod_changed', (event) => {
          console.log('TODO');
        });

        {
          const elClipTask = $('#cliptask_options');
          elClipTask.selectgroup({ title: 'Clip Task' });

          elClipTask.find('input').click((e) => {
            this.viewer.setClipTask(ClipTask[e.target.value]);
          });

          const currentClipTask = Object.keys(ClipTask)
            .filter(key => ClipTask[key] === this.viewer.clipTask);
          elClipTask.find(`input[value=${currentClipTask}]`).trigger('click');
        }

        {
          const elClipMethod = $('#clipmethod_options');
          elClipMethod.selectgroup({ title: 'Clip Method' });

          elClipMethod.find('input').click((e) => {
            this.viewer.setClipMethod(ClipMethod[e.target.value]);
          });

          const currentClipMethod = Object.keys(ClipMethod)
            .filter(key => ClipMethod[key] === this.viewer.clipMethod);
          elClipMethod.find(`input[value=${currentClipMethod}]`).trigger('click');
        }

        const clippingToolBar = $('#clipping_tools');

        // CLIP VOLUME
        clippingToolBar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/clip_volume.svg`,
          '[title]tt.clip_volume',
          () => {
            const item = this.volumeTool.startInsertion({ clip: true });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === item.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        // CLIP POLYGON
        clippingToolBar.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/clip-polygon.svg`,
          '[title]tt.clip_polygon',
          () => {
            const item = this.viewer.clippingTool.startInsertion({ type: 'polygon' });

            const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
            const jsonNode = measurementsRoot.children.find(child => child.data.uuid === item.uuid);
            $.jstree.reference(jsonNode.id).deselect_all();
            $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
          },
        ));

        { // SCREEN BOX SELECT
          const boxSelectTool = new ScreenBoxSelectTool(this.viewer);

          clippingToolBar.append(this.createToolIcon(
            `${Potree.resourcePath}/icons/clip-screen.svg`,
            '[title]tt.screen_clip_box',
            () => {
              if (!(this.viewer.scene.getActiveCamera() instanceof THREE.OrthographicCamera)) {
                this.viewer.postMessage('Switch to Orthographic Camera Mode before using the Screen-Box-Select tool.',
                  { duration: 2000 });
                return;
              }

              const item = boxSelectTool.startInsertion();

              const measurementsRoot = $('#jstree_scene').jstree().get_json('measurements');
              const jsonNode = measurementsRoot.children.find(child => child.data.uuid === item.uuid);
              $.jstree.reference(jsonNode.id).deselect_all();
              $.jstree.reference(jsonNode.id).select_node(jsonNode.id);
            },
          ));
        }

        { // REMOVE CLIPPING TOOLS
          clippingToolBar.append(this.createToolIcon(
            `${Potree.resourcePath}/icons/remove.svg`,
            '[title]tt.remove_all_measurement',
            () => {
              this.viewer.scene.removeAllClipVolumes();
            },
          ));
        }
      }

      initClassificationList() {
        const elClassificationList = $('#classificationList');

        const addClassificationItem = (code, name) => {
          const inputID = `chkClassification_${code}`;

          const element = $(`
        <li>
          <label style="whitespace: nowrap">
            <input id="${inputID}" type="checkbox" checked/>
            <span>${name}</span>
          </label>
        </li>
      `);

          const elInput = element.find('input');

          elInput.click((event) => {
            this.viewer.setClassificationVisibility(code, event.target.checked);
          });

          elClassificationList.append(element);
        };

        addClassificationItem(0, 'never classified');
        addClassificationItem(1, 'unclassified');
        addClassificationItem(2, 'ground');
        addClassificationItem(3, 'low vegetation');
        addClassificationItem(4, 'medium vegetation');
        addClassificationItem(5, 'high vegetation');
        addClassificationItem(6, 'building');
        addClassificationItem(7, 'low point(noise)');
        addClassificationItem(8, 'key-point');
        addClassificationItem(9, 'water');
        addClassificationItem(12, 'overlap');
      }

      initAccordion() {
        $('.accordion > h3').each(function () {
          const header = $(this);
          const content = $(this).next();

          // header.addClass('accordion-header ui-widget');
          // content.addClass('accordion-content ui-widget');

          content.hide();

          header.click(() => {
            content.slideToggle();
          });
        });

        const languages = [
          ['EN', 'en'],
          ['FR', 'fr'],
          ['DE', 'de'],
          ['JP', 'jp'],
        ];

        const elLanguages = $('#potree_languages');
        for (let i = 0; i < languages.length; i++) {
          const [key, value] = languages[i];
          const element = $(`<a>${key}</a>`);
          element.click(() => this.viewer.setLanguage(value));

          if (i === 0) {
            element.css('margin-left', '30px');
          }

          elLanguages.append(element);

          if (i < languages.length - 1) {
            elLanguages.append($(document.createTextNode(' - ')));
          }
        }


        // to close all, call
        // $(".accordion > div").hide()

        // to open the, for example, tool menu, call:
        // $("#menu_tools").next().show()
      }

      initAppearance() {
        $('#sldPointBudget').slider({
          value: this.viewer.getPointBudget(),
          min: 100 * 1000,
          max: 10 * 1000 * 1000,
          step: 1000,
          slide: (event, ui) => { this.viewer.setPointBudget(ui.value); },
        });

        $('#sldFOV').slider({
          value: this.viewer.getFOV(),
          min: 20,
          max: 100,
          step: 1,
          slide: (event, ui) => { this.viewer.setFOV(ui.value); },
        });

        $('#sldEDLRadius').slider({
          value: this.viewer.getEDLRadius(),
          min: 1,
          max: 4,
          step: 0.01,
          slide: (event, ui) => { this.viewer.setEDLRadius(ui.value); },
        });

        $('#sldEDLStrength').slider({
          value: this.viewer.getEDLStrength(),
          min: 0,
          max: 5,
          step: 0.01,
          slide: (event, ui) => { this.viewer.setEDLStrength(ui.value); },
        });

        this.viewer.addEventListener('point_budget_changed', (event) => {
          $('#lblPointBudget')[0].innerHTML = Utils.addCommas(this.viewer.getPointBudget());
          $('#sldPointBudget').slider({ value: this.viewer.getPointBudget() });
        });

        this.viewer.addEventListener('fov_changed', (event) => {
          $('#lblFOV')[0].innerHTML = parseInt(this.viewer.getFOV());
          $('#sldFOV').slider({ value: this.viewer.getFOV() });
        });

        this.viewer.addEventListener('edl_radius_changed', (event) => {
          $('#lblEDLRadius')[0].innerHTML = this.viewer.getEDLRadius().toFixed(1);
          $('#sldEDLRadius').slider({ value: this.viewer.getEDLRadius() });
        });

        this.viewer.addEventListener('edl_strength_changed', (event) => {
          $('#lblEDLStrength')[0].innerHTML = this.viewer.getEDLStrength().toFixed(1);
          $('#sldEDLStrength').slider({ value: this.viewer.getEDLStrength() });
        });

        this.viewer.addEventListener('background_changed', (event) => {
          $(`input[name=background][value='${this.viewer.getBackground()}']`).prop('checked', true);
        });

        $('#lblPointBudget')[0].innerHTML = Utils.addCommas(this.viewer.getPointBudget());
        $('#lblFOV')[0].innerHTML = parseInt(this.viewer.getFOV());
        $('#lblEDLRadius')[0].innerHTML = this.viewer.getEDLRadius().toFixed(1);
        $('#lblEDLStrength')[0].innerHTML = this.viewer.getEDLStrength().toFixed(1);
        $('#chkEDLEnabled')[0].checked = this.viewer.getEDLEnabled();

        {
          const elBackground = $('#background_options');
          elBackground.selectgroup();

          elBackground.find('input').click((e) => {
            this.viewer.setBackground(e.target.value);
          });

          const currentBackground = this.viewer.getBackground();
          $(`input[name=background_options][value=${currentBackground}]`).trigger('click');
        }

        $('#chkEDLEnabled').click(() => {
          this.viewer.setEDLEnabled($('#chkEDLEnabled').prop('checked'));
        });
      }

      initNavigation() {
        const elNavigation = $('#navigation');
        const sldMoveSpeed = $('#sldMoveSpeed');
        const lblMoveSpeed = $('#lblMoveSpeed');

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/earth_controls_1.png`,
          '[title]tt.earth_control',
          () => { this.viewer.setNavigationMode(EarthControls); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/fps_controls.svg`,
          '[title]tt.flight_control',
          () => {
            this.viewer.setNavigationMode(FirstPersonControls);
            this.viewer.fpControls.lockElevation = false;
          },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/helicopter_controls.svg`,
          '[title]tt.heli_control',
          () => {
            this.viewer.setNavigationMode(FirstPersonControls);
            this.viewer.fpControls.lockElevation = true;
          },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/orbit_controls.svg`,
          '[title]tt.orbit_control',
          () => { this.viewer.setNavigationMode(OrbitControls); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/focus.svg`,
          '[title]tt.focus_control',
          () => { this.viewer.fitToScreen(); },
        ));


        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/navigation_cube.svg`,
          '[title]tt.navigation_cube_control',
          () => { this.viewer.toggleNavigationCube(); },
        ));

        elNavigation.append('<br>');


        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/left.svg`,
          '[title]tt.left_view_control',
          () => { this.viewer.setLeftView(); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/right.svg`,
          '[title]tt.right_view_control',
          () => { this.viewer.setRightView(); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/front.svg`,
          '[title]tt.front_view_control',
          () => { this.viewer.setFrontView(); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/back.svg`,
          '[title]tt.back_view_control',
          () => { this.viewer.setBackView(); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/top.svg`,
          '[title]tt.top_view_control',
          () => { this.viewer.setTopView(); },
        ));

        elNavigation.append(this.createToolIcon(
          `${Potree.resourcePath}/icons/bottom.svg`,
          '[title]tt.bottom_view_control',
          () => { this.viewer.setBottomView(); },
        ));


        const elCameraProjection = $(`
      <selectgroup id="camera_projection_options">
        <option id="camera_projection_options_perspective" value="PERSPECTIVE">Perspective</option>
        <option id="camera_projection_options_orthigraphic" value="ORTHOGRAPHIC">Orthographic</option>
      </selectgroup>
    `);
        elNavigation.append(elCameraProjection);
        elCameraProjection.selectgroup({ title: 'Camera Projection' });
        elCameraProjection.find('input').click((e) => {
          this.viewer.setCameraMode(CameraMode[e.target.value]);
        });
        const cameraMode = Object.keys(CameraMode)
          .filter(key => CameraMode[key] === this.viewer.scene.cameraMode);
        elCameraProjection.find(`input[value=${cameraMode}]`).trigger('click');

        const speedRange = new THREE.Vector2(1, 10 * 1000);

        const toLinearSpeed = value => Math.pow(value, 4) * speedRange.y + speedRange.x;

        const toExpSpeed = value => Math.pow((value - speedRange.x) / speedRange.y, 1 / 4);

        sldMoveSpeed.slider({
          value: toExpSpeed(this.viewer.getMoveSpeed()),
          min: 0,
          max: 1,
          step: 0.01,
          slide: (event, ui) => { this.viewer.setMoveSpeed(toLinearSpeed(ui.value)); },
        });

        this.viewer.addEventListener('move_speed_changed', (event) => {
          lblMoveSpeed.html(this.viewer.getMoveSpeed().toFixed(1));
          sldMoveSpeed.slider({ value: toExpSpeed(this.viewer.getMoveSpeed()) });
        });

        lblMoveSpeed.html(this.viewer.getMoveSpeed().toFixed(1));
      }


      initSettings() {
        {
          $('#sldMinNodeSize').slider({
            value: this.viewer.getMinNodeSize(),
            min: 0,
            max: 1000,
            step: 0.01,
            slide: (event, ui) => { this.viewer.setMinNodeSize(ui.value); },
          });

          this.viewer.addEventListener('minnodesize_changed', (event) => {
            $('#lblMinNodeSize').html(parseInt(this.viewer.getMinNodeSize()));
            $('#sldMinNodeSize').slider({ value: this.viewer.getMinNodeSize() });
          });
          $('#lblMinNodeSize').html(parseInt(this.viewer.getMinNodeSize()));
        }

        {
          const elSplatQuality = $('#splat_quality_options');
          elSplatQuality.selectgroup({ title: 'Splat Quality' });

          elSplatQuality.find('input').click((e) => {
            if (e.target.value === 'standard') {
              this.viewer.useHQ = false;
            } else if (e.target.value === 'hq') {
              this.viewer.useHQ = true;
            }
          });

          const currentQuality = this.viewer.useHQ ? 'hq' : 'standard';
          elSplatQuality.find(`input[value=${currentQuality}]`).trigger('click');
        }

        $('#show_bounding_box').click(() => {
          this.viewer.setShowBoundingBox($('#show_bounding_box').prop('checked'));
        });

        $('#set_freeze').click(() => {
          this.viewer.setFreeze($('#set_freeze').prop('checked'));
        });
      }
    }

    /**
       * @author mschuetz / http://mschuetz.at
       *
       *
       */

    class InputHandler extends EventDispatcher {
      constructor(viewer) {
        super();

        this.viewer = viewer;
        this.renderer = viewer.renderer;
        this.domElement = this.renderer.domElement;
        this.enabled = true;

        this.scene = null;
        this.interactiveScenes = [];
        this.interactiveObjects = new Set();
        this.inputListeners = [];
        this.blacklist = new Set();

        this.drag = null;
        this.mouse = new THREE.Vector2(0, 0);

        this.selection = [];

        this.hoveredElements = [];
        this.pressedKeys = {};

        this.wheelDelta = 0;

        this.speed = 1;

        this.logMessages = false;

        if (this.domElement.tabIndex === -1) {
          this.domElement.tabIndex = 2222;
        }

        this.domElement.addEventListener('contextmenu', (event) => { event.preventDefault(); }, false);
        this.domElement.addEventListener('click', this.onMouseClick.bind(this), false);
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
        this.domElement.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false); // Firefox
        this.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this));
        this.domElement.addEventListener('keydown', this.onKeyDown.bind(this));
        this.domElement.addEventListener('keyup', this.onKeyUp.bind(this));
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
      }

      addInputListener(listener) {
        this.inputListeners.push(listener);
      }

      removeInputListener(listener) {
        this.inputListeners = this.inputListeners.filter(e => e !== listener);
      }

      getSortedListeners() {
        return this.inputListeners.sort((a, b) => {
          const ia = (a.importance !== undefined) ? a.importance : 0;
          const ib = (b.importance !== undefined) ? b.importance : 0;

          return ib - ia;
        });
      }

      onTouchStart(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onTouchStart`);

        e.preventDefault();

        if (e.touches.length === 1) {
          const rect = this.domElement.getBoundingClientRect();
          const x = e.touches[0].pageX - rect.left;
          const y = e.touches[0].pageY - rect.top;
          this.mouse.set(x, y);

          this.startDragging(null);
        }


        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: e.type,
            touches: e.touches,
            changedTouches: e.changedTouches,
          });
        }
      }

      onTouchEnd(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onTouchEnd`);

        e.preventDefault();

        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: 'drop',
            drag: this.drag,
            viewer: this.viewer,
          });
        }

        this.drag = null;

        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: e.type,
            touches: e.touches,
            changedTouches: e.changedTouches,
          });
        }
      }

      onTouchMove(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onTouchMove`);

        e.preventDefault();

        if (e.touches.length === 1) {
          const rect = this.domElement.getBoundingClientRect();
          const x = e.touches[0].pageX - rect.left;
          const y = e.touches[0].pageY - rect.top;
          this.mouse.set(x, y);

          if (this.drag) {
            this.drag.mouse = 1;

            this.drag.lastDrag.x = x - this.drag.end.x;
            this.drag.lastDrag.y = y - this.drag.end.y;

            this.drag.end.set(x, y);

            if (this.logMessages) console.log(`${this.constructor.name}: drag: `);
            for (const inputListener of this.getSortedListeners()) {
              inputListener.dispatchEvent({
                type: 'drag',
                drag: this.drag,
                viewer: this.viewer,
              });
            }
          }
        }

        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: e.type,
            touches: e.touches,
            changedTouches: e.changedTouches,
          });
        }

        // DEBUG CODE
        // let debugTouches = [...e.touches, {
        //	pageX: this.domElement.clientWidth / 2,
        //	pageY: this.domElement.clientHeight / 2}];
        // for(let inputListener of this.getSortedListeners()){
        //	inputListener.dispatchEvent({
        //		type: e.type,
        //		touches: debugTouches,
        //		changedTouches: e.changedTouches
        //	});
        // }
      }

      onKeyDown(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onKeyDown`);

        // DELETE
        if (e.keyCode === KeyCodes.DELETE && this.selection.length > 0) {
          this.dispatchEvent({
            type: 'delete',
            selection: this.selection,
          });

          this.deselectAll();
        }

        this.dispatchEvent({
          type: 'keydown',
          keyCode: e.keyCode,
          event: e,
        });

        // for(let l of this.getSortedListeners()){
        //	l.dispatchEvent({
        //		type: "keydown",
        //		keyCode: e.keyCode,
        //		event: e
        //	});
        // }

        this.pressedKeys[e.keyCode] = true;

        // e.preventDefault();
      }

      onKeyUp(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onKeyUp`);

        delete this.pressedKeys[e.keyCode];

        e.preventDefault();
      }

      onDoubleClick(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onDoubleClick`);

        let consumed = false;
        for (const hovered of this.hoveredElements) {
          if (hovered._listeners && hovered._listeners.dblclick) {
            hovered.object.dispatchEvent({
              type: 'dblclick',
              mouse: this.mouse,
              object: hovered.object,
            });
            consumed = true;
            break;
          }
        }

        if (!consumed) {
          for (const inputListener of this.getSortedListeners()) {
            inputListener.dispatchEvent({
              type: 'dblclick',
              mouse: this.mouse,
              object: null,
            });
          }
        }

        e.preventDefault();
      }

      onMouseClick(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onMouseClick`);

        e.preventDefault();
      }

      onMouseDown(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onMouseDown`);

        e.preventDefault();

        let consumed = false;
        const consume = () => consumed = true;
        if (this.hoveredElements.length === 0) {
          for (const inputListener of this.getSortedListeners()) {
            inputListener.dispatchEvent({
              type: 'mousedown',
              viewer: this.viewer,
              mouse: this.mouse,
            });
          }
        } else {
          for (const hovered of this.hoveredElements) {
            const object = hovered.object;
            object.dispatchEvent({
              type: 'mousedown',
              viewer: this.viewer,
              consume,
            });

            if (consumed) {
              break;
            }
          }
        }

        if (!this.drag) {
          const target = this.hoveredElements
            .find(el => (
              el.object._listeners &&
                el.object._listeners.drag &&
                el.object._listeners.drag.length > 0));

          if (target) {
            this.startDragging(target.object, { location: target.point });
          } else {
            this.startDragging(null);
          }
        }

        if (this.scene) {
          this.viewStart = this.scene.view.clone();
        }
      }

      onMouseUp(e) {
        if (this.logMessages) console.log(`${this.constructor.name}: onMouseUp`);

        e.preventDefault();

        const noMovement = this.getNormalizedDrag().length() === 0;


        let consumed = false;
        const consume = () => consumed = true;
        if (this.hoveredElements.length === 0) {
          for (const inputListener of this.getSortedListeners()) {
            inputListener.dispatchEvent({
              type: 'mouseup',
              viewer: this.viewer,
              mouse: this.mouse,
              consume,
            });

            if (consumed) {
              break;
            }
          }
        } else {
          const hovered = this.hoveredElements
            .map(e => e.object)
            .find(e => (e._listeners && e._listeners.mouseup));
          if (hovered) {
            hovered.dispatchEvent({
              type: 'mouseup',
              viewer: this.viewer,
              consume,
            });
          }
        }

        if (this.drag) {
          if (this.drag.object) {
            if (this.logMessages) console.log(`${this.constructor.name}: drop ${this.drag.object.name}`);
            this.drag.object.dispatchEvent({
              type: 'drop',
              drag: this.drag,
              viewer: this.viewer,

            });
          } else {
            for (const inputListener of this.getSortedListeners()) {
              inputListener.dispatchEvent({
                type: 'drop',
                drag: this.drag,
                viewer: this.viewer,
              });
            }
          }

          // check for a click
          const clicked = this.hoveredElements.map(h => h.object).find(v => v === this.drag.object) !== undefined;
          if (clicked) {
            if (this.logMessages) console.log(`${this.constructor.name}: click ${this.drag.object.name}`);
            this.drag.object.dispatchEvent({
              type: 'click',
              viewer: this.viewer,
              consume,
            });
          }

          this.drag = null;
        }

        if (!consumed) {
          if (e.button === THREE.MOUSE.LEFT) {
            if (noMovement) {
              let selectable = this.hoveredElements
                .find(el => el.object._listeners && el.object._listeners.select);

              if (selectable) {
                selectable = selectable.object;

                if (this.isSelected(selectable)) {
                  this.selection
                    .filter(e => e !== selectable)
                    .forEach(e => this.toggleSelection(e));
                } else {
                  this.deselectAll();
                  this.toggleSelection(selectable);
                }
              } else {
                this.deselectAll();
              }
            }
          } else if ((e.button === THREE.MOUSE.RIGHT) && noMovement) {
            this.deselectAll();
          }
        }
      }

      onMouseMove(e) {
        e.preventDefault();

        const rect = this.domElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.mouse.set(x, y);

        const hoveredElements = this.getHoveredElements();
        if (hoveredElements.length > 0) {
          const names = hoveredElements.map(h => h.object.name).join(', ');
          if (this.logMessages) console.log(`${this.constructor.name}: onMouseMove; hovered: '${names}'`);
        }

        if (this.drag) {
          this.drag.mouse = e.buttons;

          this.drag.lastDrag.x = x - this.drag.end.x;
          this.drag.lastDrag.y = y - this.drag.end.y;

          this.drag.end.set(x, y);

          if (this.drag.object) {
            if (this.logMessages) console.log(`${this.constructor.name}: drag: ${this.drag.object.name}`);
            this.drag.object.dispatchEvent({
              type: 'drag',
              drag: this.drag,
              viewer: this.viewer,
            });
          } else {
            if (this.logMessages) console.log(`${this.constructor.name}: drag: `);

            let dragConsumed = false;
            for (const inputListener of this.getSortedListeners()) {
              inputListener.dispatchEvent({
                type: 'drag',
                drag: this.drag,
                viewer: this.viewer,
                consume: () => { dragConsumed = true; },
              });

              if (dragConsumed) {
                break;
              }
            }
          }
        } else {
          const curr = hoveredElements.map(a => a.object).find(a => true);
          const prev = this.hoveredElements.map(a => a.object).find(a => true);

          if (curr !== prev) {
            if (curr) {
              if (this.logMessages) console.log(`${this.constructor.name}: mouseover: ${curr.name}`);
              curr.dispatchEvent({
                type: 'mouseover',
                object: curr,
              });
            }
            if (prev) {
              if (this.logMessages) console.log(`${this.constructor.name}: mouseleave: ${prev.name}`);
              prev.dispatchEvent({
                type: 'mouseleave',
                object: prev,
              });
            }
          }

          if (hoveredElements.length > 0) {
            const object = hoveredElements
              .map(e => e.object)
              .find(e => (e._listeners && e._listeners.mousemove));

            if (object) {
              object.dispatchEvent({
                type: 'mousemove',
                object,
              });
            }
          }
        }


        this.hoveredElements = hoveredElements;
      }

      onMouseWheel(e) {
        if (!this.enabled) return;

        if (this.logMessages) console.log(`${this.constructor.name}: onMouseWheel`);

        e.preventDefault();

        let delta = 0;
        if (e.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
          delta = e.wheelDelta;
        } else if (e.detail !== undefined) { // Firefox
          delta = -e.detail;
        }

        const ndelta = Math.sign(delta);

        // this.wheelDelta += Math.sign(delta);

        if (this.hoveredElement) {
          this.hoveredElement.object.dispatchEvent({
            type: 'mousewheel',
            delta: ndelta,
            object: this.hoveredElement.object,
          });
        } else {
          for (const inputListener of this.getSortedListeners()) {
            inputListener.dispatchEvent({
              type: 'mousewheel',
              delta: ndelta,
              object: null,
            });
          }
        }
      }

      startDragging(object, args = null) {
        const name = object ? object.name : 'no name';
        if (this.logMessages) console.log(`${this.constructor.name}: startDragging: '${name}'`);

        this.drag = {
          start: this.mouse.clone(),
          end: this.mouse.clone(),
          lastDrag: new THREE.Vector2(0, 0),
          startView: this.scene.view.clone(),
          object,
        };

        if (args) {
          for (const key of Object.keys(args)) {
            this.drag[key] = args[key];
          }
        }
      }

      getMousePointCloudIntersection(mouse) {
        return Utils.getMousePointCloudIntersection(
          this.mouse,
          this.scene.getActiveCamera(),
          this.viewer,
          this.scene.pointclouds);
      }

      toggleSelection(object) {
        const oldSelection = this.selection;

        const index = this.selection.indexOf(object);

        if (index === -1) {
          this.selection.push(object);
          object.dispatchEvent({
            type: 'select',
          });
        } else {
          this.selection.splice(index, 1);
          object.dispatchEvent({
            type: 'deselect',
          });
        }

        this.dispatchEvent({
          type: 'selection_changed',
          oldSelection,
          selection: this.selection,
        });
      }

      deselect(object) {
        const oldSelection = this.selection;

        const index = this.selection.indexOf(object);

        if (index >= 0) {
          this.selection.splice(index, 1);
          object.dispatchEvent({
            type: 'deselect',
          });

          this.dispatchEvent({
            type: 'selection_changed',
            oldSelection,
            selection: this.selection,
          });
        }
      }

      deselectAll() {
        for (const object of this.selection) {
          object.dispatchEvent({
            type: 'deselect',
          });
        }

        const oldSelection = this.selection;

        if (this.selection.length > 0) {
          this.selection = [];
          this.dispatchEvent({
            type: 'selection_changed',
            oldSelection,
            selection: this.selection,
          });
        }
      }

      isSelected(object) {
        const index = this.selection.indexOf(object);

        return index !== -1;
      }

      registerInteractiveObject(object) {
        this.interactiveObjects.add(object);
      }

      removeInteractiveObject(object) {
        this.interactiveObjects.delete(object);
      }

      registerInteractiveScene(scene) {
        const index = this.interactiveScenes.indexOf(scene);
        if (index === -1) {
          this.interactiveScenes.push(scene);
        }
      }

      unregisterInteractiveScene(scene) {
        const index = this.interactiveScenes.indexOf(scene);
        if (index > -1) {
          this.interactiveScenes.splice(index, 1);
        }
      }

      getHoveredElement() {
        const hoveredElements = this.getHoveredElements();
        if (hoveredElements.length > 0) {
          return hoveredElements[0];
        }
        return null;
      }

      getHoveredElements() {
        const scenes = this.interactiveScenes.concat(this.scene.scene);

        const interactableListeners = ['mouseup', 'mousemove', 'mouseover', 'mouseleave', 'drag', 'drop', 'click', 'select', 'deselect'];
        const interactables = [];
        for (const scene of scenes) {
          scene.traverseVisible((node) => {
            if (node._listeners && node.visible && !this.blacklist.has(node)) {
              const hasInteractableListener = interactableListeners.filter(e => node._listeners[e] !== undefined).length > 0;

              if (hasInteractableListener) {
                interactables.push(node);
              }
            }
          });
        }

        const camera = this.scene.getActiveCamera();
        const ray = Utils.mouseToRay(this.mouse, camera, this.domElement.clientWidth, this.domElement.clientHeight);

        const raycaster = new THREE.Raycaster();
        raycaster.ray.set(ray.origin, ray.direction);
        raycaster.linePrecision = 0.2;

        const intersections = raycaster.intersectObjects(interactables.filter(o => o.visible), false);

        return intersections;

        // if(intersections.length > 0){
        //	return intersections[0];
        // }else{
        //	return null;
        // }
      }

      setScene(scene) {
        this.deselectAll();

        this.scene = scene;
      }

      update(delta) {

      }

      getNormalizedDrag() {
        if (!this.drag) {
          return new THREE.Vector2(0, 0);
        }

        const diff = new THREE.Vector2().subVectors(this.drag.end, this.drag.start);

        diff.x /= this.domElement.clientWidth;
        diff.y /= this.domElement.clientHeight;

        return diff;
      }

      getNormalizedLastDrag() {
        if (!this.drag) {
          return new THREE.Vector2(0, 0);
        }

        const lastDrag = this.drag.lastDrag.clone();

        lastDrag.x /= this.domElement.clientWidth;
        lastDrag.y /= this.domElement.clientHeight;

        return lastDrag;
      }
    }

    class NavigationCube extends THREE.Object3D {
      constructor(viewer) {
        super();

        this.viewer = viewer;

        const createPlaneMaterial = (img) => {
          const material = new THREE.MeshBasicMaterial({
            depthTest: true,
            depthWrite: true,
            side: THREE.DoubleSide,
          });
          new THREE.TextureLoader().load(
            `${exports.resourcePath}/textures/navigation/${img}`,
            (texture) => {
              texture.anisotropy = viewer.renderer.capabilities.getMaxAnisotropy();
              material.map = texture;
              material.needsUpdate = true;
            });
          return material;
        };

        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        this.front = new THREE.Mesh(planeGeometry, createPlaneMaterial('F.png'));
        this.front.position.y = -0.5;
        this.front.rotation.x = Math.PI / 2.0;
        this.front.updateMatrixWorld();
        this.front.name = 'F';
        this.add(this.front);

        this.back = new THREE.Mesh(planeGeometry, createPlaneMaterial('B.png'));
        this.back.position.y = 0.5;
        this.back.rotation.x = Math.PI / 2.0;
        this.back.updateMatrixWorld();
        this.back.name = 'B';
        this.add(this.back);

        this.left = new THREE.Mesh(planeGeometry, createPlaneMaterial('L.png'));
        this.left.position.x = -0.5;
        this.left.rotation.y = Math.PI / 2.0;
        this.left.updateMatrixWorld();
        this.left.name = 'L';
        this.add(this.left);

        this.right = new THREE.Mesh(planeGeometry, createPlaneMaterial('R.png'));
        this.right.position.x = 0.5;
        this.right.rotation.y = Math.PI / 2.0;
        this.right.updateMatrixWorld();
        this.right.name = 'R';
        this.add(this.right);

        this.bottom = new THREE.Mesh(planeGeometry, createPlaneMaterial('D.png'));
        this.bottom.position.z = -0.5;
        this.bottom.updateMatrixWorld();
        this.bottom.name = 'D';
        this.add(this.bottom);

        this.top = new THREE.Mesh(planeGeometry, createPlaneMaterial('U.png'));
        this.top.position.z = 0.5;
        this.top.updateMatrixWorld();
        this.top.name = 'U';
        this.add(this.top);

        this.width = 150; // in px

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.camera.position.copy(new THREE.Vector3(0, 0, 0));
        this.camera.lookAt(new THREE.Vector3(0, 1, 0));
        this.camera.updateMatrixWorld();
        this.camera.rotation.order = 'ZXY';

        const onMouseDown = (event) => {
          this.pickedFace = null;
          const mouse = new THREE.Vector2();
          mouse.x = event.clientX - (window.innerWidth - this.width);
          mouse.y = event.clientY;

          if (mouse.x < 0 || mouse.y > this.width) return;

          mouse.x = (mouse.x / this.width) * 2 - 1;
          mouse.y = -(mouse.y / this.width) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);
          raycaster.ray.origin.sub(this.camera.getWorldDirection(new THREE.Vector3()));

          const intersects = raycaster.intersectObjects(this.children);

          let minDistance = 1000;
          for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].distance < minDistance) {
              this.pickedFace = intersects[i].object.name;
              minDistance = intersects[i].distance;
            }
          }
          if (this.pickedFace) {
            this.viewer.setView(this.pickedFace);
          }
        };

        this.viewer.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
      }

      update(rotation) {
        this.camera.rotation.copy(rotation);
        this.camera.updateMatrixWorld();
      }
    }

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

    class DeviceOrientationControls extends EventDispatcher {
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

        const screenOrientationChange = (e) => {
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

      update(delta) {
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
          viewer.scene.cameraP.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        }
      }
    }

    class Viewer extends EventDispatcher {
      constructor(domElement, args = {}) {
        super();

        this.renderArea = domElement;
        this.guiLoaded = false;
        this.guiLoadTasks = [];

        this.messages = [];
        this.elMessages = $(`
    <div id="message_listing" 
      style="position: absolute; z-index: 1000; left: 10px; bottom: 10px">
    </div>`);
        $(domElement).append(this.elMessages);

        try {
          { // generate missing dom hierarchy
            if ($(domElement).find('#potree_map').length === 0) {
              const potreeMap = $(`
          <div id="potree_map" class="mapBox" style="position: absolute; left: 50px; top: 50px; width: 400px; height: 400px; display: none">
            <div id="potree_map_header" style="position: absolute; width: 100%; height: 25px; top: 0px; background-color: rgba(0,0,0,0.5); z-index: 1000; border-top-left-radius: 3px; border-top-right-radius: 3px;">
            </div>
            <div id="potree_map_content" class="map" style="position: absolute; z-index: 100; top: 25px; width: 100%; height: calc(100% - 25px); border: 2px solid rgba(0,0,0,0.5); box-sizing: border-box;"></div>
          </div>
        `);
              $(domElement).append(potreeMap);
            }

            if ($(domElement).find('#potree_description').length === 0) {
              const potreeDescription = $('<div id="potree_description" class="potree_info_text"></div>');
              $(domElement).append(potreeDescription);
            }

            if ($(domElement).find('#potree_annotations').length === 0) {
              const potreeAnnotationContainer = $(`
          <div id="potree_annotation_container" 
            style="position: absolute; z-index: 100000; width: 100%; height: 100%; pointer-events: none;"></div>`);
              $(domElement).append(potreeAnnotationContainer);
            }
          }

          this.pointCloudLoadedCallback = args.onPointCloudLoaded || function () { };

          // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
          //	defaultSettings.navigation = "Orbit";
          // }

          this.server = null;

          this.fov = 60;
          this.isFlipYZ = false;
          this.useDEMCollisions = false;
          this.generateDEM = false;
          this.minNodeSize = 30;
          this.edlStrength = 1.0;
          this.edlRadius = 1.4;
          this.useEDL = false;
          this.classifications = {
            0: { visible: true, name: 'never classified' },
            1: { visible: true, name: 'unclassified' },
            2: { visible: true, name: 'ground' },
            3: { visible: true, name: 'low vegetation' },
            4: { visible: true, name: 'medium vegetation' },
            5: { visible: true, name: 'high vegetation' },
            6: { visible: true, name: 'building' },
            7: { visible: true, name: 'low point(noise)' },
            8: { visible: true, name: 'key-point' },
            9: { visible: true, name: 'water' },
            12: { visible: true, name: 'overlap' },
          };

          this.moveSpeed = 10;

          this.LENGTH_UNITS = {
            METER: { code: 'm' },
            FEET: { code: 'ft' },
            INCH: { code: '\u2033' },
          };
          this.lengthUnit = this.LENGTH_UNITS.METER;

          this.showBoundingBox = false;
          this.showAnnotations = true;
          this.freeze = false;
          this.clipTask = ClipTask.HIGHLIGHT;
          this.clipMethod = ClipMethod.INSIDE_ANY;

          this.potreeRenderer = null;
          this.edlRenderer = null;
          this.renderer = null;
          this.pRenderer = null;

          this.scene = null;
          this.overlay = null;
          this.overlayCamera = null;

          this.inputHandler = null;

          this.clippingTool = null;
          this.transformationTool = null;
          this.navigationCube = null;

          this.skybox = null;
          this.clock = new THREE.Clock();
          this.background = null;

          this.initThree();

          {
            const canvas = this.renderer.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              console.log(e);
              this.postMessage('WebGL context lost. \u2639');

              const gl = this.renderer.getContext();
              const error = gl.getError();
              console.log(error);
            }, false);
          }

          {
            this.overlay = new THREE.Scene();
            this.overlayCamera = new THREE.OrthographicCamera(
              0, 1,
              1, 0,
              -1000, 1000,
            );
          }

          this.pRenderer = new Renderer(this.renderer);

          {
            const near = 2.5;
            const far = 10.0;
            const fov = 90;

            this.shadowTestCam = new THREE.PerspectiveCamera(90, 1, near, far);
            this.shadowTestCam.position.set(3.50, -2.80, 8.561);
            this.shadowTestCam.lookAt(new THREE.Vector3(0, 0, 4.87));
          }


          const scene = new Scene(this.renderer);
          this.setScene(scene);

          {
            this.inputHandler = new InputHandler(this);
            this.inputHandler.setScene(this.scene);

            this.clippingTool = new ClippingTool(this);
            this.transformationTool = new TransformationTool(this);
            this.navigationCube = new NavigationCube(this);
            this.navigationCube.visible = false;

            this.createControls();

            this.clippingTool.setScene(this.scene);

            const onPointcloudAdded = (e) => {
              if (this.scene.pointclouds.length === 1) {
                let speed = e.pointcloud.boundingBox.getSize(new THREE.Vector3()).length();
                speed /= 5;
                this.setMoveSpeed(speed);
              }
            };

            const onVolumeRemoved = (e) => {
              this.inputHandler.deselect(e.volume);
            };

            this.addEventListener('scene_changed', (e) => {
              this.inputHandler.setScene(e.scene);
              this.clippingTool.setScene(this.scene);

              if (!e.scene.hasEventListener('pointcloud_added', onPointcloudAdded)) {
                e.scene.addEventListener('pointcloud_added', onPointcloudAdded);
              }

              if (!e.scene.hasEventListener('volume_removed', onPointcloudAdded)) {
                e.scene.addEventListener('volume_removed', onVolumeRemoved);
              }
            });

            this.scene.addEventListener('volume_removed', onVolumeRemoved);
            this.scene.addEventListener('pointcloud_added', onPointcloudAdded);
          }

          { // set defaults
            this.setFOV(60);
            this.setEDLEnabled(false);
            this.setEDLRadius(1.4);
            this.setEDLStrength(0.4);
            this.setClipTask(ClipTask.HIGHLIGHT);
            this.setClipMethod(ClipMethod.INSIDE_ANY);
            this.setPointBudget(1 * 1000 * 1000);
            this.setShowBoundingBox(false);
            this.setFreeze(false);
            this.setNavigationMode(OrbitControls);
            this.setBackground('gradient');

            this.scaleFactor = 1;

            this.loadSettingsFromURL();
          }

          // start rendering!
          if (args.useDefaultRenderLoop === undefined || args.useDefaultRenderLoop === true) {
            requestAnimationFrame(this.loop.bind(this));
          }

          this.loadGUI = this.loadGUI.bind(this);
        } catch (e) {
          this.onCrash(e);
        }
      }

      onCrash(error) {
        $(this.renderArea).empty();

        if ($(this.renderArea).find('#potree_failpage').length === 0) {
          const elFailPage = $(`
      <div id="#potree_failpage" class="potree_failpage"> 
        
        <h1>Potree Encountered An Error </h1>

        <p>
        This may happen if your browser or graphics card is not supported.
        <br>
        We recommend to use 
        <a href="https://www.google.com/chrome/browser" target="_blank" style="color:initial">Chrome</a>
        or 
        <a href="https://www.mozilla.org/" target="_blank">Firefox</a>.
        </p>

        <p>
        Please also visit <a href="http://webglreport.com/" target="_blank">webglreport.com</a> and 
        check whether your system supports WebGL.
        </p>
        <p>
        If you are already using one of the recommended browsers and WebGL is enabled, 
        consider filing an issue report at <a href="https://github.com/potree/potree/issues" target="_blank">github</a>,<br>
        including your operating system, graphics card, browser and browser version, as well as the 
        error message below.<br>
        Please do not report errors on unsupported browsers.
        </p>

        <pre id="potree_error_console" style="width: 100%; height: 100%"></pre>
        
      </div>`);

          const elErrorMessage = elFailPage.find('#potree_error_console');
          elErrorMessage.html(error.stack);

          $(this.renderArea).append(elFailPage);
        }

        throw error;
      }

      // ------------------------------------------------------------------------------------
      // Viewer API
      // ------------------------------------------------------------------------------------

      setScene(scene) {
        if (scene === this.scene) {
          return;
        }

        const oldScene = this.scene;
        this.scene = scene;

        this.dispatchEvent({
          type: 'scene_changed',
          oldScene,
          scene,
        });

        { // Annotations
          $('.annotation').detach();

          // for(let annotation of this.scene.annotations){
          //	this.renderArea.appendChild(annotation.domElement[0]);
          // }

          this.scene.annotations.traverse((annotation) => {
            this.renderArea.appendChild(annotation.domElement[0]);
          });

          if (!this.onAnnotationAdded) {
            this.onAnnotationAdded = (e) => {
              // console.log("annotation added: " + e.annotation.title);

              e.annotation.traverse((node) => {
                $('#potree_annotation_container').append(node.domElement);
                // this.renderArea.appendChild(node.domElement[0]);
                node.scene = this.scene;
              });
            };
          }

          if (oldScene) {
            oldScene.annotations.removeEventListener('annotation_added', this.onAnnotationAdded);
          }
          this.scene.annotations.addEventListener('annotation_added', this.onAnnotationAdded);
        }
      }

      getControls(navigationMode) {
        if (navigationMode === OrbitControls) {
          return this.orbitControls;
        } else if (navigationMode === FirstPersonControls) {
          return this.fpControls;
        } else if (navigationMode === EarthControls) {
          return this.earthControls;
        } else if (navigationMode === DeviceOrientationControls) {
          return this.deviceControls;
        }
        return null;
      }

      getMinNodeSize() {
        return this.minNodeSize;
      }

      setMinNodeSize(value) {
        if (this.minNodeSize !== value) {
          this.minNodeSize = value;
          this.dispatchEvent({ type: 'minnodesize_changed', viewer: this });
        }
      }

      getBackground() {
        return this.background;
      }

      setBackground(bg) {
        if (this.background === bg) {
          return;
        }

        if (bg === 'skybox') {
          this.skybox = Utils.loadSkybox(new URL(`${Potree.resourcePath}/textures/skybox2/`).href);
        }

        this.background = bg;
        this.dispatchEvent({ type: 'background_changed', viewer: this });
      }

      setDescription(value) {
        $('#potree_description')[0].innerHTML = value;
      }

      setNavigationMode(value) {
        this.scene.view.navigationMode = value;
      }

      setShowBoundingBox(value) {
        if (this.showBoundingBox !== value) {
          this.showBoundingBox = value;
          this.dispatchEvent({ type: 'show_boundingbox_changed', viewer: this });
        }
      }

      getShowBoundingBox() {
        return this.showBoundingBox;
      }

      setMoveSpeed(value) {
        if (this.moveSpeed !== value) {
          this.moveSpeed = value;
          this.dispatchEvent({ type: 'move_speed_changed', viewer: this, speed: value });
        }
      }

      getMoveSpeed() {
        return this.moveSpeed;
      }

      setWeightClassification(w) {
        for (let i = 0; i < this.scene.pointclouds.length; i++) {
          this.scene.pointclouds[i].material.weightClassification = w;
          this.dispatchEvent({ type: `attribute_weights_changed${i}`, viewer: this });
        }
      }

      setFreeze(value) {
        value = Boolean(value);
        if (this.freeze !== value) {
          this.freeze = value;
          this.dispatchEvent({ type: 'freeze_changed', viewer: this });
        }
      }

      getFreeze() {
        return this.freeze;
      }

      getClipTask() {
        return this.clipTask;
      }

      getClipMethod() {
        return this.clipMethod;
      }

      setClipTask(value) {
        if (this.clipTask !== value) {
          this.clipTask = value;

          this.dispatchEvent({
            type: 'cliptask_changed',
            viewer: this,
          });
        }
      }

      setClipMethod(value) {
        if (this.clipMethod !== value) {
          this.clipMethod = value;

          this.dispatchEvent({
            type: 'clipmethod_changed',
            viewer: this,
          });
        }
      }

      setPointBudget(value) {
        if (Potree.pointBudget !== value) {
          Potree.pointBudget = parseInt(value);
          this.dispatchEvent({ type: 'point_budget_changed', viewer: this });
        }
      }

      getPointBudget() {
        return Potree.pointBudget;
      }

      setShowAnnotations(value) {
        if (this.showAnnotations !== value) {
          this.showAnnotations = value;
          this.dispatchEvent({ type: 'show_annotations_changed', viewer: this });
        }
      }

      getShowAnnotations() {
        return this.showAnnotations;
      }

      setDEMCollisionsEnabled(value) {
        if (this.useDEMCollisions !== value) {
          this.useDEMCollisions = value;
          this.dispatchEvent({ type: 'use_demcollisions_changed', viewer: this });
        }
      }

      getDEMCollisionsEnabled() {
        return this.useDEMCollisions;
      }

      setEDLEnabled(value) {
        value = Boolean(value);
        if (this.useEDL !== value) {
          this.useEDL = value;
          this.dispatchEvent({ type: 'use_edl_changed', viewer: this });
        }
      }

      getEDLEnabled() {
        return this.useEDL;
      }

      setEDLRadius(value) {
        if (this.edlRadius !== value) {
          this.edlRadius = value;
          this.dispatchEvent({ type: 'edl_radius_changed', viewer: this });
        }
      }

      getEDLRadius() {
        return this.edlRadius;
      }

      setEDLStrength(value) {
        if (this.edlStrength !== value) {
          this.edlStrength = value;
          this.dispatchEvent({ type: 'edl_strength_changed', viewer: this });
        }
      }

      getEDLStrength() {
        return this.edlStrength;
      }

      setFOV(value) {
        if (this.fov !== value) {
          this.fov = value;
          this.dispatchEvent({ type: 'fov_changed', viewer: this });
        }
      }

      getFOV() {
        return this.fov;
      }

      disableAnnotations() {
        this.scene.annotations.traverse((annotation) => {
          annotation.domElement.css('pointer-events', 'none');

          // return annotation.visible;
        });
      }

      enableAnnotations() {
        this.scene.annotations.traverse((annotation) => {
          annotation.domElement.css('pointer-events', 'auto');

          // return annotation.visible;
        });
      }

      setClassificationVisibility(key, value) {
        if (!this.classifications[key]) {
          this.classifications[key] = { visible: value, name: 'no name' };
          this.dispatchEvent({ type: 'classification_visibility_changed', viewer: this });
        } else if (this.classifications[key].visible !== value) {
          this.classifications[key].visible = value;
          this.dispatchEvent({ type: 'classification_visibility_changed', viewer: this });
        }
      }

      setLengthUnit(value) {
        switch (value) {
          case 'm':
            this.lengthUnit = this.LENGTH_UNITS.METER;
            break;
          case 'ft':
            this.lengthUnit = this.LENGTH_UNITS.FEET;
            break;
          case 'in':
            this.lengthUnit = this.LENGTH_UNITS.INCH;
            break;
        }

        this.dispatchEvent({ type: 'length_unit_changed', viewer: this, value });
      }

      zoomTo(node, factor, animationDuration = 0) {
        const view = this.scene.view;

        const camera = this.scene.cameraP.clone();
        camera.rotation.copy(this.scene.cameraP.rotation);
        camera.rotation.order = 'ZXY';
        camera.rotation.x = Math.PI / 2 + view.pitch;
        camera.rotation.z = view.yaw;
        camera.updateMatrix();
        camera.updateMatrixWorld();
        camera.zoomTo(node, factor);

        let bs;
        if (node.boundingSphere) {
          bs = node.boundingSphere;
        } else if (node.geometry && node.geometry.boundingSphere) {
          bs = node.geometry.boundingSphere;
        } else {
          bs = node.boundingBox.getBoundingSphere(new THREE.Sphere());
        }
        bs = bs.clone().applyMatrix4(node.matrixWorld);

        const startPosition = view.position.clone();
        const endPosition = camera.position.clone();
        const startTarget = view.getPivot();
        const endTarget = bs.center;
        const startRadius = view.radius;
        const endRadius = endPosition.distanceTo(endTarget);

        const easing = TWEEN.Easing.Quartic.Out;

        { // animate camera position
          const pos = startPosition.clone();
          const tween = new TWEEN.Tween(pos).to(endPosition, animationDuration);
          tween.easing(easing);

          tween.onUpdate(() => {
            view.position.copy(pos);
          });

          tween.start();
        }

        { // animate camera target
          const target = startTarget.clone();
          const tween = new TWEEN.Tween(target).to(endTarget, animationDuration);
          tween.easing(easing);
          tween.onUpdate(() => {
            view.lookAt(target);
          });
          tween.onComplete(() => {
            view.lookAt(target);
            this.dispatchEvent({ type: 'focusing_finished', target: this });
          });

          this.dispatchEvent({ type: 'focusing_started', target: this });
          tween.start();
        }
      }

      showAbout() {
        $(() => {
          $('#about-panel').dialog();
        });
      }

      getBoundingBox(pointclouds) {
        return this.scene.getBoundingBox(pointclouds);
      }

      fitToScreen(factor = 1, animationDuration = 0) {
        const box = this.getBoundingBox(this.scene.pointclouds);

        const node = new THREE.Object3D();
        node.boundingBox = box;

        this.zoomTo(node, factor, animationDuration);
        this.controls.stop();
      }

      toggleNavigationCube() {
        this.navigationCube.visible = !this.navigationCube.visible;
      }

      setView(view) {
        if (!view) return;

        switch (view) {
          case 'F':
            this.setFrontView();
            break;
          case 'B':
            this.setBackView();
            break;
          case 'L':
            this.setLeftView();
            break;
          case 'R':
            this.setRightView();
            break;
          case 'U':
            this.setTopView();
            break;
          case 'D':
            this.setBottomView();
            break;
        }
      }

      setTopView() {
        this.scene.view.yaw = 0;
        this.scene.view.pitch = -Math.PI / 2;

        this.fitToScreen();
      }

      setBottomView() {
        this.scene.view.yaw = -Math.PI;
        this.scene.view.pitch = Math.PI / 2;

        this.fitToScreen();
      }

      setFrontView() {
        this.scene.view.yaw = 0;
        this.scene.view.pitch = 0;

        this.fitToScreen();
      }

      setBackView() {
        this.scene.view.yaw = Math.PI;
        this.scene.view.pitch = 0;

        this.fitToScreen();
      }

      setLeftView() {
        this.scene.view.yaw = -Math.PI / 2;
        this.scene.view.pitch = 0;

        this.fitToScreen();
      }

      setRightView() {
        this.scene.view.yaw = Math.PI / 2;
        this.scene.view.pitch = 0;

        this.fitToScreen();
      }

      flipYZ() {
        this.isFlipYZ = !this.isFlipYZ;

        // TODO flipyz
        console.log('TODO');
      }

      setCameraMode(mode) {
        this.scene.cameraMode = mode;

        for (const pointcloud of this.scene.pointclouds) {
          pointcloud.material.useOrthographicCamera = mode == CameraMode.ORTHOGRAPHIC;
        }
      }

      loadSettingsFromURL() {
        if (Utils.getParameterByName('pointSize')) {
          this.setPointSize(parseFloat(Utils.getParameterByName('pointSize')));
        }

        if (Utils.getParameterByName('FOV')) {
          this.setFOV(parseFloat(Utils.getParameterByName('FOV')));
        }

        if (Utils.getParameterByName('opacity')) {
          this.setOpacity(parseFloat(Utils.getParameterByName('opacity')));
        }

        if (Utils.getParameterByName('edlEnabled')) {
          const enabled = Utils.getParameterByName('edlEnabled') === 'true';
          this.setEDLEnabled(enabled);
        }

        if (Utils.getParameterByName('edlRadius')) {
          this.setEDLRadius(parseFloat(Utils.getParameterByName('edlRadius')));
        }

        if (Utils.getParameterByName('edlStrength')) {
          this.setEDLStrength(parseFloat(Utils.getParameterByName('edlStrength')));
        }

        if (Utils.getParameterByName('pointBudget')) {
          this.setPointBudget(parseFloat(Utils.getParameterByName('pointBudget')));
        }

        if (Utils.getParameterByName('showBoundingBox')) {
          const enabled = Utils.getParameterByName('showBoundingBox') === 'true';
          if (enabled) {
            this.setShowBoundingBox(true);
          } else {
            this.setShowBoundingBox(false);
          }
        }

        if (Utils.getParameterByName('material')) {
          const material = Utils.getParameterByName('material');
          this.setMaterial(material);
        }

        if (Utils.getParameterByName('pointSizing')) {
          const sizing = Utils.getParameterByName('pointSizing');
          this.setPointSizing(sizing);
        }

        if (Utils.getParameterByName('quality')) {
          const quality = Utils.getParameterByName('quality');
          this.setQuality(quality);
        }

        if (Utils.getParameterByName('position')) {
          let value = Utils.getParameterByName('position');
          value = value.replace('[', '').replace(']', '');
          const tokens = value.split(';');
          const x = parseFloat(tokens[0]);
          const y = parseFloat(tokens[1]);
          const z = parseFloat(tokens[2]);

          this.scene.view.position.set(x, y, z);
        }

        if (Utils.getParameterByName('target')) {
          let value = Utils.getParameterByName('target');
          value = value.replace('[', '').replace(']', '');
          const tokens = value.split(';');
          const x = parseFloat(tokens[0]);
          const y = parseFloat(tokens[1]);
          const z = parseFloat(tokens[2]);

          this.scene.view.lookAt(new THREE.Vector3(x, y, z));
        }

        if (Utils.getParameterByName('background')) {
          const value = Utils.getParameterByName('background');
          this.setBackground(value);
        }

        // if(Utils.getParameterByName("elevationRange")){
        //	let value = Utils.getParameterByName("elevationRange");
        //	value = value.replace("[", "").replace("]", "");
        //	let tokens = value.split(";");
        //	let x = parseFloat(tokens[0]);
        //	let y = parseFloat(tokens[1]);
        //
        //	this.setElevationRange(x, y);
        //	//this.scene.view.target.set(x, y, z);
        // }
      }

      // ------------------------------------------------------------------------------------
      // Viewer Internals
      // ------------------------------------------------------------------------------------

      createControls() {
        { // create FIRST PERSON CONTROLS
          this.fpControls = new FirstPersonControls(this);
          this.fpControls.enabled = false;
          this.fpControls.addEventListener('start', this.disableAnnotations.bind(this));
          this.fpControls.addEventListener('end', this.enableAnnotations.bind(this));
          // this.fpControls.addEventListener("double_click_move", (event) => {
          //	let distance = event.targetLocation.distanceTo(event.position);
          //	this.setMoveSpeed(Math.pow(distance, 0.4));
          // });
          // this.fpControls.addEventListener("move_speed_changed", (event) => {
          //	this.setMoveSpeed(this.fpControls.moveSpeed);
          // });
        }

        // { // create GEO CONTROLS
        //	this.geoControls = new GeoControls(this.scene.camera, this.renderer.domElement);
        //	this.geoControls.enabled = false;
        //	this.geoControls.addEventListener("start", this.disableAnnotations.bind(this));
        //	this.geoControls.addEventListener("end", this.enableAnnotations.bind(this));
        //	this.geoControls.addEventListener("move_speed_changed", (event) => {
        //		this.setMoveSpeed(this.geoControls.moveSpeed);
        //	});
        // }

        { // create ORBIT CONTROLS
          this.orbitControls = new OrbitControls(this);
          this.orbitControls.enabled = false;
          this.orbitControls.addEventListener('start', this.disableAnnotations.bind(this));
          this.orbitControls.addEventListener('end', this.enableAnnotations.bind(this));
        }

        { // create EARTH CONTROLS
          this.earthControls = new EarthControls(this);
          this.earthControls.enabled = false;
          this.earthControls.addEventListener('start', this.disableAnnotations.bind(this));
          this.earthControls.addEventListener('end', this.enableAnnotations.bind(this));
        }

        { // create DEVICE ORIENTATION CONTROLS
          this.deviceControls = new DeviceOrientationControls(this);
          this.deviceControls.enabled = false;
          this.deviceControls.addEventListener('start', this.disableAnnotations.bind(this));
          this.deviceControls.addEventListener('end', this.enableAnnotations.bind(this));
        }
      }

      toggleSidebar() {
        const renderArea = $('#potree_render_area');
        const isVisible = renderArea.css('left') !== '0px';

        if (isVisible) {
          renderArea.css('left', '0px');
        } else {
          renderArea.css('left', '300px');
        }
      }

      toggleMap() {
        // let map = $('#potree_map');
        // map.toggle(100);

        if (this.mapView) {
          this.mapView.toggle();
        }
      }

      onGUILoaded(callback) {
        if (this.guiLoaded) {
          callback();
        } else {
          this.guiLoadTasks.push(callback);
        }
      }

      loadGUI(callback) {
        this.onGUILoaded(callback);

        const viewer = this;
        const sidebarContainer = $('#potree_sidebar_container');
        // sidebarContainer.load(new URL(Potree.scriptPath + '/sidebar.html').href, () => {
        sidebarContainer.load((`${Potree.scriptPath}/sidebar.html`), () => {
          sidebarContainer.css('width', '300px');
          sidebarContainer.css('height', '100%');

          const imgMenuToggle = document.createElement('img');
          // imgMenuToggle.src = new URL(Potree.resourcePath + '/icons/menu_button.svg').href;
          imgMenuToggle.src = `${Potree.resourcePath}/icons/menu_button.svg`;
          imgMenuToggle.onclick = this.toggleSidebar;
          imgMenuToggle.classList.add('potree_menu_toggle');

          const imgMapToggle = document.createElement('img');
          // imgMapToggle.src = new URL(Potree.resourcePath + '/icons/map_icon.png').href;
          imgMapToggle.src = `${Potree.resourcePath}/icons/map_icon.png`;
          imgMapToggle.style.display = 'none';
          imgMapToggle.onclick = (e) => { this.toggleMap(); };
          imgMapToggle.id = 'potree_map_toggle';

          viewer.renderArea.insertBefore(imgMapToggle, viewer.renderArea.children[0]);
          viewer.renderArea.insertBefore(imgMenuToggle, viewer.renderArea.children[0]);

          this.mapView = new MapView(this);
          this.mapView.init();

          i18n.init({
            lng: 'en',
            resGetPath: `${Potree.resourcePath}/lang/__lng__/__ns__.json`,
            preload: ['en', 'fr', 'de', 'jp'],
            getAsync: true,
            debug: false,
          }, (t) => {
            // Start translation once everything is loaded
            $('body').i18n();
          });

          $(() => {
            // initSidebar(this);
            const sidebar = new Sidebar(this);
            sidebar.init();

            // if (callback) {
            //	$(callback);
            // }

            const elProfile = $('<div>').load(new URL(`${Potree.scriptPath}/profile.html`).href, () => {
              $(document.body).append(elProfile.children());
              this.profileWindow = new ProfileWindow(this);
              this.profileWindowController = new ProfileWindowController(this);

              $('#profile_window').draggable({
                handle: $('#profile_titlebar'),
                containment: $(document.body),
              });
              $('#profile_window').resizable({
                containment: $(document.body),
                handles: 'n, e, s, w',
              });

              $(() => {
                this.guiLoaded = true;
                for (const task of this.guiLoadTasks) {
                  task();
                }
              });
            });
          });
        });
      }

      setLanguage(lang) {
        i18n.setLng(lang);
        $('body').i18n();
      }

      setServer(server) {
        this.server = server;
      }

      initThree() {
        const width = this.renderArea.clientWidth;
        const height = this.renderArea.clientHeight;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
        this.renderer.sortObjects = false;
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;
        this.renderArea.appendChild(this.renderer.domElement);
        this.renderer.domElement.tabIndex = '2222';
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.addEventListener('mousedown', () => {
          this.renderer.domElement.focus();
        });
        // this.renderer.domElement.focus();

        // enable frag_depth extension for the interpolation shader, if available
        const gl = this.renderer.context;
        gl.getExtension('EXT_frag_depth');
        gl.getExtension('WEBGL_depth_texture');

        const extVAO = gl.getExtension('OES_vertex_array_object');
        gl.createVertexArray = extVAO.createVertexArrayOES.bind(extVAO);
        gl.bindVertexArray = extVAO.bindVertexArrayOES.bind(extVAO);
        // gl.bindVertexArray = extVAO.asdfbindVertexArrayOES.bind(extVAO);
      }

      updateAnnotations() {
        if (!this.visibleAnnotations) {
          this.visibleAnnotations = new Set();
        }

        this.scene.annotations.updateBounds();
        this.scene.cameraP.updateMatrixWorld();
        this.scene.cameraO.updateMatrixWorld();

        const distances = [];

        const renderAreaWidth = this.renderer.getSize().width;
        const renderAreaHeight = this.renderer.getSize().height;

        const viewer = this;

        const visibleNow = [];
        this.scene.annotations.traverse((annotation) => {
          if (annotation === this.scene.annotations) {
            return true;
          }

          if (!annotation.visible) {
            return false;
          }

          annotation.scene = this.scene;

          const element = annotation.domElement;

          let position = annotation.position.clone();
          position.add(annotation.offset);
          if (!position) {
            position = annotation.boundingBox.getCenter(new THREE.Vector3());
          }

          const distance = viewer.scene.cameraP.position.distanceTo(position);
          const radius = annotation.boundingBox.getBoundingSphere(new THREE.Sphere()).radius;

          const screenPos = new THREE.Vector3();
          let screenSize = 0;

          {
            // SCREEN POS
            screenPos.copy(position).project(this.scene.getActiveCamera());
            screenPos.x = renderAreaWidth * (screenPos.x + 1) / 2;
            screenPos.y = renderAreaHeight * (1 - (screenPos.y + 1) / 2);


            // SCREEN SIZE
            if (viewer.scene.cameraMode == CameraMode.PERSPECTIVE) {
              const fov = Math.PI * viewer.scene.cameraP.fov / 180;
              const slope = Math.tan(fov / 2.0);
              const projFactor = 0.5 * renderAreaHeight / (slope * distance);
              screenSize = radius * projFactor;
            } else {
              screenSize = Utils.projectedRadiusOrtho(radius, viewer.scene.cameraO.projectionMatrix, renderAreaWidth, renderAreaHeight);
            }
          }

          element.css('left', `${screenPos.x}px`);
          element.css('top', `${screenPos.y}px`);
          // element.css("display", "block");

          let zIndex = 10000000 - distance * (10000000 / this.scene.cameraP.far);
          if (annotation.descriptionVisible) {
            zIndex += 10000000;
          }
          element.css('z-index', parseInt(zIndex));

          if (annotation.children.length > 0) {
            const expand = screenSize > annotation.collapseThreshold || annotation.boundingBox.containsPoint(this.scene.getActiveCamera().position);
            annotation.expand = expand;

            if (!expand) {
              // annotation.display = (screenPos.z >= -1 && screenPos.z <= 1);
              const inFrustum = (screenPos.z >= -1 && screenPos.z <= 1);
              if (inFrustum) {
                visibleNow.push(annotation);
              }
            }

            return expand;
          }
          // annotation.display = (screenPos.z >= -1 && screenPos.z <= 1);
          const inFrustum = (screenPos.z >= -1 && screenPos.z <= 1);
          if (inFrustum) {
            visibleNow.push(annotation);
          }
        });

        const notVisibleAnymore = new Set(this.visibleAnnotations);
        for (const annotation of visibleNow) {
          annotation.display = true;

          notVisibleAnymore.delete(annotation);
        }
        this.visibleAnnotations = visibleNow;

        for (const annotation of notVisibleAnymore) {
          annotation.display = false;
        }
      }

      update(delta, timestamp) {
        if (Potree.measureTimings) performance.mark('update-start');

        // if(window.urlToggle === undefined){
        //	window.urlToggle = 0;
        // }else{
        //
        //	if(window.urlToggle > 1){
        //		{
        //
        //			let currentValue = Utils.getParameterByName("position");
        //			let strPosition = "["
        //				+ this.scene.view.position.x.toFixed(3) + ";"
        //				+ this.scene.view.position.y.toFixed(3) + ";"
        //				+ this.scene.view.position.z.toFixed(3) + "]";
        //			if(currentValue !== strPosition){
        //				Utils.setParameter("position", strPosition);
        //			}
        //
        //		}
        //
        //		{
        //			let currentValue = Utils.getParameterByName("target");
        //			let pivot = this.scene.view.getPivot();
        //			let strTarget = "["
        //				+ pivot.x.toFixed(3) + ";"
        //				+ pivot.y.toFixed(3) + ";"
        //				+ pivot.z.toFixed(3) + "]";
        //			if(currentValue !== strTarget){
        //				Utils.setParameter("target", strTarget);
        //			}
        //		}
        //
        //		window.urlToggle = 0;
        //	}
        //
        //	window.urlToggle += delta;
        // }

        {
          const u = Math.sin(0.0005 * timestamp) * 0.5 - 0.4;

          const x = Math.cos(u);
          const y = Math.sin(u);

          this.shadowTestCam.position.set(7 * x, 7 * y, 8.561);
          this.shadowTestCam.lookAt(new THREE.Vector3(0, 0, 0));
        }


        const scene = this.scene;
        const camera = scene.getActiveCamera();

        Potree.pointLoadLimit = Potree.pointBudget * 2;

        this.scene.directionalLight.position.copy(camera.position);
        this.scene.directionalLight.lookAt(new THREE.Vector3().addVectors(camera.position, camera.getWorldDirection(new THREE.Vector3())));

        for (const pointcloud of this.scene.pointclouds) {
          if (!pointcloud.material._defaultIntensityRangeChanged) {
            const root = pointcloud.pcoGeometry.root;
            if (root != null && root.loaded) {
              const attributes = pointcloud.pcoGeometry.root.geometry.attributes;
              if (attributes.intensity) {
                const array = attributes.intensity.array;

                // chose max value from the 0.75 percentile
                const ordered = [];
                for (let j = 0; j < array.length; j++) {
                  ordered.push(array[j]);
                }
                ordered.sort();
                const capIndex = parseInt((ordered.length - 1) * 0.75);
                const cap = ordered[capIndex];

                if (cap <= 1) {
                  pointcloud.material.intensityRange = [0, 1];
                } else if (cap <= 256) {
                  pointcloud.material.intensityRange = [0, 255];
                } else {
                  pointcloud.material.intensityRange = [0, cap];
                }
              }
              // pointcloud._intensityMaxEvaluated = true;
            }
          }

          pointcloud.showBoundingBox = this.showBoundingBox;
          pointcloud.generateDEM = this.generateDEM;
          pointcloud.minimumNodePixelSize = this.minNodeSize;
        }

        // update classification visibility
        for (const pointcloud of this.scene.pointclouds) {
          const classification = pointcloud.material.classification;
          let somethingChanged = false;
          for (const key of Object.keys(this.classifications)) {
            const w = this.classifications[key].visible ? 1 : 0;

            if (classification[key]) {
              if (classification[key].w !== w) {
                classification[key].w = w;
                somethingChanged = true;
              }
            } else if (classification.DEFAULT) {
              classification[key] = classification.DEFAULT;
              somethingChanged = true;
            } else {
              classification[key] = new THREE.Vector4(0.3, 0.6, 0.6, 0.5);
              somethingChanged = true;
            }
          }

          if (somethingChanged) {
            pointcloud.material.recomputeClassification();
          }
        }

        {
          if (this.showBoundingBox) {
            let bbRoot = this.scene.scene.getObjectByName('potree_bounding_box_root');
            if (!bbRoot) {
              const node = new THREE.Object3D();
              node.name = 'potree_bounding_box_root';
              this.scene.scene.add(node);
              bbRoot = node;
            }

            const visibleBoxes = [];
            for (const pointcloud of this.scene.pointclouds) {
              for (const node of pointcloud.visibleNodes.filter(vn => vn.boundingBoxNode !== undefined)) {
                const box = node.boundingBoxNode;
                visibleBoxes.push(box);
              }
            }

            bbRoot.children = visibleBoxes;
          }
        }

        if (!this.freeze) {
          const result = Potree.updatePointClouds(scene.pointclouds, camera, this.renderer);


          // DEBUG - ONLY DISPLAY NODES THAT INTERSECT MOUSE
          // if(false){

          //	let renderer = viewer.renderer;
          //	let mouse = viewer.inputHandler.mouse;

          //	let nmouse = {
          //		x: (mouse.x / renderer.domElement.clientWidth) * 2 - 1,
          //		y: -(mouse.y / renderer.domElement.clientHeight) * 2 + 1
          //	};

          //	let pickParams = {};

          //	//if(params.pickClipped){
          //	//	pickParams.pickClipped = params.pickClipped;
          //	//}

          //	pickParams.x = mouse.x;
          //	pickParams.y = renderer.domElement.clientHeight - mouse.y;

          //	let raycaster = new THREE.Raycaster();
          //	raycaster.setFromCamera(nmouse, camera);
          //	let ray = raycaster.ray;

          //	for(let pointcloud of scene.pointclouds){
          //		let nodes = pointcloud.nodesOnRay(pointcloud.visibleNodes, ray);
          //		pointcloud.visibleNodes = nodes;

          //	}
          // }

          if (result.lowestSpacing !== Infinity) {
            let near = result.lowestSpacing * 10.0;
            let far = -this.getBoundingBox().applyMatrix4(camera.matrixWorldInverse).min.z;

            far = Math.max(far * 1.5, 1000);
            near = Math.min(100.0, Math.max(0.01, near));
            far = Math.max(far, near + 1000);

            if (near === Infinity) {
              near = 0.1;
            }

            camera.near = near;
            camera.far = far;
          } else {
            // don't change near and far in this case
          }

          if (this.scene.cameraMode == CameraMode.ORTHOGRAPHIC) {
            camera.near = -camera.far;
          }
        }

        this.scene.cameraP.fov = this.fov;

        // Navigation mode changed?
        if (this.getControls(scene.view.navigationMode) !== this.controls) {
          if (this.controls) {
            this.controls.enabled = false;
            this.inputHandler.removeInputListener(this.controls);
          }

          this.controls = this.getControls(scene.view.navigationMode);
          this.controls.enabled = true;
          this.inputHandler.addInputListener(this.controls);
        }

        if (this.getControls(scene.view.navigationMode) === this.deviceControls) {
          this.controls.setScene(scene);
          this.controls.update(delta);

          this.scene.cameraP.position.copy(scene.view.position);
          this.scene.cameraO.position.copy(scene.view.position);
        } else if (this.controls !== null) {
          this.controls.setScene(scene);
          this.controls.update(delta);

          this.scene.cameraP.position.copy(scene.view.position);
          this.scene.cameraP.rotation.order = 'ZXY';
          this.scene.cameraP.rotation.x = Math.PI / 2 + this.scene.view.pitch;
          this.scene.cameraP.rotation.z = this.scene.view.yaw;

          this.scene.cameraO.position.copy(scene.view.position);
          this.scene.cameraO.rotation.order = 'ZXY';
          this.scene.cameraO.rotation.x = Math.PI / 2 + this.scene.view.pitch;
          this.scene.cameraO.rotation.z = this.scene.view.yaw;
        }

        camera.updateMatrix();
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse(camera.matrixWorld);

        {
          if (this._previousCamera === undefined) {
            this._previousCamera = this.scene.getActiveCamera().clone();
            this._previousCamera.rotation.copy(this.scene.getActiveCamera());
          }

          if (!this._previousCamera.matrixWorld.equals(camera.matrixWorld)) {
            this.dispatchEvent({
              type: 'camera_changed',
              previous: this._previousCamera,
              camera,
            });
          } else if (!this._previousCamera.projectionMatrix.equals(camera.projectionMatrix)) {
            this.dispatchEvent({
              type: 'camera_changed',
              previous: this._previousCamera,
              camera,
            });
          }

          this._previousCamera = this.scene.getActiveCamera().clone();
          this._previousCamera.rotation.copy(this.scene.getActiveCamera());
        }

        { // update clip boxes
          const boxes = [];

          // volumes with clipping enabled
          // boxes.push(...this.scene.volumes.filter(v => (v.clip)));
          boxes.push(...this.scene.volumes.filter(v => (v.clip && v instanceof BoxVolume)));

          // profile segments
          for (const profile of this.scene.profiles) {
            boxes.push(...profile.boxes);
          }

          const clipBoxes = boxes.map((box) => {
            box.updateMatrixWorld();
            const boxInverse = new THREE.Matrix4().getInverse(box.matrixWorld);
            const boxPosition = box.getWorldPosition(new THREE.Vector3());
            return { box, inverse: boxInverse, position: boxPosition };
          });

          const clipPolygons = this.scene.polygonClipVolumes.filter(vol => vol.initialized);

          // set clip volumes in material
          for (const pointcloud of this.scene.pointclouds.filter(pc => pc.visible)) {
            pointcloud.material.setClipBoxes(clipBoxes);
            pointcloud.material.setClipPolygons(clipPolygons, this.clippingTool.maxPolygonVertices);
            pointcloud.material.clipTask = this.clipTask;
            pointcloud.material.clipMethod = this.clipMethod;
          }
        }

        { // update navigation cube
          this.navigationCube.update(camera.rotation);
        }

        this.updateAnnotations();

        if (this.mapView) {
          this.mapView.update(delta);
          if (this.mapView.sceneProjection) {
            $('#potree_map_toggle').css('display', 'block');
          }
        }

        TWEEN.update(timestamp);

        this.dispatchEvent({
          type: 'update',
          delta,
          timestamp,
        });

        if (Potree.measureTimings) {
          performance.mark('update-end');
          performance.measure('update', 'update-start', 'update-end');
        }
      }

      render() {
        if (Potree.measureTimings) performance.mark('render-start');

        { // resize
          const width = this.scaleFactor * this.renderArea.clientWidth;
          const height = this.scaleFactor * this.renderArea.clientHeight;
          const pixelRatio = this.renderer.getPixelRatio();
          const aspect = width / height;

          this.scene.cameraP.aspect = aspect;
          this.scene.cameraP.updateProjectionMatrix();

          // let frustumScale = viewer.moveSpeed * 2.0;
          const frustumScale = this.scene.view.radius;
          this.scene.cameraO.left = -frustumScale;
          this.scene.cameraO.right = frustumScale;
          this.scene.cameraO.top = frustumScale * 1 / aspect;
          this.scene.cameraO.bottom = -frustumScale * 1 / aspect;
          this.scene.cameraO.updateProjectionMatrix();

          this.scene.cameraScreenSpace.top = 1 / aspect;
          this.scene.cameraScreenSpace.bottom = -1 / aspect;
          this.scene.cameraScreenSpace.updateProjectionMatrix();

          this.renderer.setSize(width, height);
        }

        try {
          if (this.useRep) {
            if (!this.repRenderer) {
              this.repRenderer = new RepRenderer(this);
            }
            this.repRenderer.render(this.renderer);
          } else if (this.useHQ) {
            if (!this.hqRenderer) {
              this.hqRenderer = new HQSplatRenderer(this);
            }
            this.hqRenderer.useEDL = this.useEDL;
            this.hqRenderer.render(this.renderer);
          } else if (this.useEDL && Features.SHADER_EDL.isSupported()) {
            if (!this.edlRenderer) {
              this.edlRenderer = new EDLRenderer(this);
            }
            this.edlRenderer.render(this.renderer);
          } else {
            if (!this.potreeRenderer) {
              this.potreeRenderer = new PotreeRenderer(this);
            }
            this.potreeRenderer.render();
          }

          // if(this.useRep){
          //	if (!this.repRenderer) {
          //		this.repRenderer = new RepRenderer(this);
          //	}
          //	this.repRenderer.render(this.renderer);
          // } else if (this.useHQ && Features.SHADER_SPLATS.isSupported()) {
          //	if (!this.hqRenderer) {
          //		this.hqRenderer = new HQSplatRenderer(this);
          //	}
          //	this.hqRenderer.render(this.renderer);
          // } else if (this.useEDL && Features.SHADER_EDL.isSupported()) {
          //	if (!this.edlRenderer) {
          //		this.edlRenderer = new EDLRenderer(this);
          //	}
          //	this.edlRenderer.render(this.renderer);
          // } else {
          //	if (!this.potreeRenderer) {
          //		this.potreeRenderer = new PotreeRenderer(this);
          //	}

          //	this.potreeRenderer.render();
          // }

          this.renderer.render(this.overlay, this.overlayCamera);
        } catch (e) {
          this.onCrash(e);
        }

        if (Potree.measureTimings) {
          performance.mark('render-end');
          performance.measure('render', 'render-start', 'render-end');
        }
      }

      resolveTimings(timestamp) {
        if (Potree.measureTimings) {
          if (!this.toggle) {
            this.toggle = timestamp;
          }
          const duration = timestamp - this.toggle;
          if (duration > 1000.0) {
            const measures = performance.getEntriesByType('measure');

            let names = new Set();
            for (const measure of measures) {
              names.add(measure.name);
            }

            const groups = new Map();
            for (const name of names) {
              groups.set(name, {
                measures: [],
                sum: 0,
                n: 0,
                min: Infinity,
                max: -Infinity,
              });
            }

            for (const measure of measures) {
              const group = groups.get(measure.name);
              group.measures.push(measure);
              group.sum += measure.duration;
              group.n++;
              group.min = Math.min(group.min, measure.duration);
              group.max = Math.max(group.max, measure.duration);
            }

            const glQueries = Potree.resolveQueries(this.renderer.getContext());
            for (const [key, value] of glQueries) {
              const group = {
                measures: value.map(v => ({ duration: v })),
                sum: value.reduce((a, i) => a + i, 0),
                n: value.length,
                min: Math.min(...value),
                max: Math.max(...value),
              };

              const groupname = `[tq] ${key}`;
              groups.set(groupname, group);
              names.add(groupname);
            }

            for (const [name, group] of groups) {
              group.mean = group.sum / group.n;
              group.measures.sort((a, b) => a.duration - b.duration);

              if (group.n === 1) {
                group.median = group.measures[0].duration;
              } else if (group.n > 1) {
                group.median = group.measures[parseInt(group.n / 2)].duration;
              }
            }

            const cn = Array.from(names).reduce((a, i) => Math.max(a, i.length), 0) + 5;
            const cmin = 10;
            const cmed = 10;
            const cmax = 10;
            const csam = 6;

            let message = ` ${'NAME'.padEnd(cn)} |`
                + ` ${'MIN'.padStart(cmin)} |`
                + ` ${'MEDIAN'.padStart(cmed)} |`
                + ` ${'MAX'.padStart(cmax)} |`
                + ` ${'SAMPLES'.padStart(csam)} \n`;
            message += ` ${'-'.repeat(message.length)}\n`;

            names = Array.from(names).sort();
            for (const name of names) {
              const group = groups.get(name);
              const min = group.min.toFixed(3);
              const median = group.median.toFixed(3);
              const max = group.max.toFixed(3);
              const n = group.n;

              message += ` ${name.padEnd(cn)} |`
                  + ` ${min.padStart(cmin)} |`
                  + ` ${median.padStart(cmed)} |`
                  + ` ${max.padStart(cmax)} |`
                  + ` ${n.toString().padStart(csam)}\n`;
            }
            message += '\n';
            console.log(message);

            performance.clearMarks();
            performance.clearMeasures();
            this.toggle = timestamp;
          }
        }
      }

      loop(timestamp) {
        requestAnimationFrame(this.loop.bind(this));

        let queryAll;
        if (Potree.measureTimings) {
          performance.mark('loop-start');
        }

        this.update(this.clock.getDelta(), timestamp);

        this.render();

        if (Potree.measureTimings) {
          performance.mark('loop-end');
          performance.measure('loop', 'loop-start', 'loop-end');
        }

        this.resolveTimings(timestamp);

        Potree.framenumber++;
      }

      postError(content, params = {}) {
        const message = this.postMessage(content, params);

        message.element.addClass('potree_message_error');

        return message;
      }

      postMessage(content, params = {}) {
        const message = new Message(content);

        const animationDuration = 100;

        message.element.css('display', 'none');
        message.elClose.click(() => {
          message.element.slideToggle(animationDuration);

          const index = this.messages.indexOf(message);
          if (index >= 0) {
            this.messages.splice(index, 1);
          }
        });

        this.elMessages.prepend(message.element);

        message.element.slideToggle(animationDuration);

        this.messages.push(message);

        if (params.duration !== undefined) {
          const fadeDuration = 500;
          const slideOutDuration = 200;
          setTimeout(() => {
            message.element.animate({
              opacity: 0,
            }, fadeDuration);
            message.element.slideToggle(slideOutDuration);
          }, params.duration);
        }

        return message;
      }
    }

    THREE.OrthographicCamera.prototype.zoomTo = function (node, factor = 1) {
      if (!node.geometry && !node.boundingBox) {
        return;
      }

      // TODO

      // let minWS = new THREE.Vector4(node.boundingBox.min.x, node.boundingBox.min.y, node.boundingBox.min.z, 1);
      // let minVS = minWS.applyMatrix4(this.matrixWorldInverse);

      // let right = node.boundingBox.max.x;
      // let bottom	= node.boundingBox.min.y;
      // let top = node.boundingBox.max.y;

      this.updateProjectionMatrix();
    };

    THREE.PerspectiveCamera.prototype.zoomTo = function (node, factor) {
      if (!node.geometry && !node.boundingSphere && !node.boundingBox) {
        return;
      }

      if (node.geometry && node.geometry.boundingSphere === null) {
        node.geometry.computeBoundingSphere();
      }

      node.updateMatrixWorld();

      let bs;

      if (node.boundingSphere) {
        bs = node.boundingSphere;
      } else if (node.geometry && node.geometry.boundingSphere) {
        bs = node.geometry.boundingSphere;
      } else {
        bs = node.boundingBox.getBoundingSphere(new THREE.Sphere());
      }

      const _factor = factor || 1;

      bs = bs.clone().applyMatrix4(node.matrixWorld);
      const radius = bs.radius;
      let fovr = this.fov * Math.PI / 180;

      if (this.aspect < 1) {
        fovr *= this.aspect;
      }

      const distanceFactor = Math.abs(radius / Math.sin(fovr / 2)) * _factor;

      const offset = this.getWorldDirection(new THREE.Vector3()).multiplyScalar(-distanceFactor);
      this.position.copy(bs.center.clone().add(offset));
    };

    THREE.Ray.prototype.distanceToPlaneWithNegative = function (plane) {
      const denominator = plane.normal.dot(this.direction);
      if (denominator === 0) {
        // line is coplanar, return origin
        if (plane.distanceToPoint(this.origin) === 0) {
          return 0;
        }

        // Null is preferable to undefined since undefined means.... it is undefined
        return null;
      }
      const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;

      return t;
    };

    const workerPool = new WorkerPool();

    const version = {
      major: 1,
      minor: 6,
      suffix: '',
    };

    const lru = new LRU();
    // let lru = new LRU;
    console.log(`Potree ${version.major}.${version.minor}${version.suffix}`);

    const pointBudget = 1 * 1000 * 1000;
    const framenumber = 0;
    const numNodesLoading = 0;
    const maxNodesLoading = 4;

    const debug = {};

    exports.scriptPath = '/static';
    // if (document.currentScript.src) {
    // 	exports.scriptPath = new URL(document.currentScript.src + '/..').href;
    // 	if (exports.scriptPath.slice(-1) === '/') {
    // 		exports.scriptPath = exports.scriptPath.slice(0, -1);
    // 	}
    // } else {
    // 	console.error('Potree was unable to find its script path using document.currentScript. Is Potree included with a script tag? Does your browser support this function?');
    // }

    const resourcePath = `${exports.scriptPath}/resources`;
    // let resourcePath = '/static/resources';


    function loadPointCloud(path, name, callback) {
      const loaded = function (pointcloud) {
        pointcloud.name = name;
        callback({ type: 'pointcloud_loaded', pointcloud });
      };

        // load pointcloud
      if (!path) {
        // TODO: callback? comment? Hello? Bueller? Anyone?
      } else if (path.indexOf('greyhound://') === 0) {
        // We check if the path string starts with 'greyhound:', if so we assume it's a greyhound server URL.
        GreyhoundLoader.load(path, (geometry) => {
          if (!geometry) {
            // callback({type: 'loading_failed'});
            console.error(new Error(`failed to load point cloud from URL: ${path}`));
          } else {
            const pointcloud = new PointCloudOctree(geometry);
            loaded(pointcloud);
          }
        });
      } else if (path.indexOf('cloud.js') > 0) {
        POCLoader.load(path, (geometry) => {
          if (!geometry) {
            // callback({type: 'loading_failed'});
            console.error(new Error(`failed to load point cloud from URL: ${path}`));
          } else {
            const pointcloud = new PointCloudOctree(geometry);
            loaded(pointcloud);
          }
        });
      } else if (path.indexOf('.vpc') > 0) {
        PointCloudArena4DGeometry.load(path, (geometry) => {
          if (!geometry) {
            // callback({type: 'loading_failed'});
            console.error(new Error(`failed to load point cloud from URL: ${path}`));
          } else {
            const pointcloud = new PointCloudArena4D(geometry);
            loaded(pointcloud);
          }
        });
      } else {
        // callback({'type': 'loading_failed'});
        console.error(new Error(`failed to load point cloud from URL: ${path}`));
      }
    }


    // add selectgroup
    (function ($) {
      $.fn.extend({
        selectgroup(args = {}) {
          const elGroup = $(this);
          const rootID = elGroup.prop('id');
          const groupID = `${rootID}`;
          const groupTitle = (args.title !== undefined) ? args.title : '';

          const elButtons = [];
          elGroup.find('option').each((index, value) => {
            const buttonID = $(value).prop('id');
            const label = $(value).html();
            const optionValue = $(value).prop('value');

            const elButton = $(`
          <span style="flex-grow: 1; display: inherit">
          <label for="${buttonID}" class="ui-button" style="width: 100%; padding: .4em .1em">${label}</label>
          <input type="radio" name="${groupID}" id="${buttonID}" value="${optionValue}" style="display: none"/>
          </span>
        `);
            const elLabel = elButton.find('label');
            const elInput = elButton.find('input');

            elInput.change(() => {
              elGroup.find('label').removeClass('ui-state-active');
              elGroup.find('label').addClass('ui-state-default');
              if (elInput.is(':checked')) {
                elLabel.addClass('ui-state-active');
              } else {
                // elLabel.addClass("ui-state-default");
              }
            });

            elButtons.push(elButton);
          });

          const elFieldset = $(`
        <fieldset style="border: none; margin: 0px; padding: 0px">
          <legend>${groupTitle}</legend>
          <span style="display: flex">

          </span>
        </fieldset>
      `);

          const elButtonContainer = elFieldset.find('span');
          for (const elButton of elButtons) {
            elButtonContainer.append(elButton);
          }

          elButtonContainer.find('label').each((index, value) => {
            $(value).css('margin', '0px');
            $(value).css('border-radius', '0px');
            $(value).css('border', '1px solid black');
            $(value).css('border-left', 'none');
          });
          elButtonContainer.find('label:first').each((index, value) => {
            $(value).css('border-radius', '4px 0px 0px 4px');
          });
          elButtonContainer.find('label:last').each((index, value) => {
            $(value).css('border-radius', '0px 4px 4px 0px');
            $(value).css('border-left', 'none');
          });

          elGroup.empty();
          elGroup.append(elFieldset);
        },
      });
    }(jQuery));

    exports.workerPool = workerPool;
    exports.version = version;
    exports.lru = lru;
    exports.pointBudget = pointBudget;
    exports.framenumber = framenumber;
    exports.numNodesLoading = numNodesLoading;
    exports.maxNodesLoading = maxNodesLoading;
    exports.debug = debug;
    exports.resourcePath = resourcePath;
    exports.loadPointCloud = loadPointCloud;
    exports.Action = Action;
    exports.PathAnimation = PathAnimation;
    exports.AnimationPath = AnimationPath;
    exports.Annotation = Annotation;
    exports.CameraMode = CameraMode;
    exports.ClipTask = ClipTask;
    exports.ClipMethod = ClipMethod;
    exports.MOUSE = MOUSE;
    exports.PointSizeType = PointSizeType;
    exports.PointShape = PointShape;
    exports.PointColorType = PointColorType;
    exports.TreeType = TreeType;
    exports.Enum = Enum;
    exports.EnumItem = EnumItem;
    exports.EventDispatcher = EventDispatcher;
    exports.Features = Features;
    exports.KeyCodes = KeyCodes;
    exports.LRU = LRU;
    exports.LRUItem = LRUItem;
    exports.PointCloudGreyhoundGeometry = PointCloudGreyhoundGeometry;
    exports.PointCloudGreyhoundGeometryNode = PointCloudGreyhoundGeometryNode;
    exports.PointCloudOctreeNode = PointCloudOctreeNode;
    exports.PointCloudOctree = PointCloudOctree;
    exports.PointCloudOctreeGeometry = PointCloudOctreeGeometry;
    exports.PointCloudOctreeGeometryNode = PointCloudOctreeGeometryNode;
    exports.PointCloudTreeNode = PointCloudTreeNode;
    exports.PointCloudTree = PointCloudTree;
    exports.Points = Points;
    exports.updatePointClouds = updatePointClouds;
    exports.updateVisibilityStructures = updateVisibilityStructures;
    exports.updateVisibility = updateVisibility;
    exports.Renderer = Renderer;
    exports.ProfileData = ProfileData;
    exports.ProfileRequest = ProfileRequest;
    exports.TextSprite = TextSprite;
    exports.Utils = Utils;
    exports.Version = Version;
    exports.WorkerPool = WorkerPool;
    exports.XHRFactory = XHRFactory;
    exports.ClassificationScheme = ClassificationScheme;
    exports.EyeDomeLightingMaterial = EyeDomeLightingMaterial;
    exports.Gradients = Gradients;
    exports.NormalizationEDLMaterial = NormalizationEDLMaterial;
    exports.NormalizationMaterial = NormalizationMaterial;
    exports.PointCloudMaterial = PointCloudMaterial;
    exports.POCLoader = POCLoader;
    exports.GreyhoundBinaryLoader = GreyhoundBinaryLoader;
    exports.GreyhoundLoader = GreyhoundLoader;
    exports.PointAttributeNames = PointAttributeNames;
    exports.PointAttributeTypes = PointAttributeTypes;
    exports.PointAttribute = PointAttribute;
    exports.PointAttributes = PointAttributes;
    exports.Box3Helper = Box3Helper;
    exports.ClippingTool = ClippingTool;
    exports.ClipVolume = ClipVolume;
    exports.Measure = Measure;
    exports.MeasuringTool = MeasuringTool;
    exports.Message = Message;
    exports.PointCloudSM = PointCloudSM;
    exports.PolygonClipVolume = PolygonClipVolume;
    exports.Profile = Profile;
    exports.ProfileTool = ProfileTool;
    exports.ScreenBoxSelectTool = ScreenBoxSelectTool;
    exports.SpotLightHelper = SpotLightHelper;
    exports.toInterleavedBufferAttribute = toInterleavedBufferAttribute;
    exports.TransformationTool = TransformationTool;
    exports.Volume = Volume;
    exports.BoxVolume = BoxVolume;
    exports.SphereVolume = SphereVolume;
    exports.VolumeTool = VolumeTool;
    exports.Viewer = Viewer;
    exports.Scene = Scene;

    Object.defineProperty(exports, '__esModule', { value: true });
  }
  ),
  )
);

export default Potree;
// # sourceMappingURL=potree.js.map
