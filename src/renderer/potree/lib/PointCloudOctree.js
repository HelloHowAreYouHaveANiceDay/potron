import * as THREE from 'three';

import PointCloudTree from './PointCloudTree';
import PointCloudMaterial from './PointCloudMaterial';
import Utils from './Utils';
import PointCloudOctreeNode from './PointCloudOctreeNode';
import PointCloudOctreeGeometryNode from './PointCloudOctreeGeometryNode';
import Potree from '../potree';


class PointCloudOctree extends PointCloudTree {
  constructor(geometry, material) {
    super();

    this.pointBudget = Infinity;
    this.pcoGeometry = geometry;
    this.boundingBox = this.pcoGeometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new THREE.Sphere());
    this.material = material || new PointCloudMaterial();
    this.visiblePointsTarget = 2 * 1000 * 1000;
    this.minimumNodePixelSize = 150;
    this.level = 0;
    this.position.copy(geometry.offset);
    this.updateMatrix();

    this.showBoundingBox = false;
    this.boundingBoxNodes = [];
    this.loadQueue = [];
    this.visibleBounds = new THREE.Box3();
    this.visibleNodes = [];
    this.visibleGeometry = [];
    this.generateDEM = false;
    this.profileRequests = [];
    this.name = '';
    this._visible = true;

    {
      let box = [this.pcoGeometry.tightBoundingBox, this.getBoundingBoxWorld()]
        .find(v => v !== undefined);

      this.updateMatrixWorld(true);
      box = Utils.computeTransformedBoundingBox(box, this.matrixWorld);

      const bMin = box.min.z;
      const bMax = box.max.z;
      this.material.heightMin = bMin;
      this.material.heightMax = bMax;
    }

    // TODO read projection from file instead
    this.projection = geometry.projection;

    this.root = this.pcoGeometry.root;
  }

  setName(name) {
    if (this.name !== name) {
      this.name = name;
      this.dispatchEvent({ type: 'name_changed', name, pointcloud: this });
    }
  }

  getName() {
    return this.name;
  }

  toTreeNode(geometryNode, parent) {
    const node = new PointCloudOctreeNode();

    // if(geometryNode.name === "r40206"){
    //	console.log("creating node for r40206");
    // }
    const sceneNode = new THREE.Points(geometryNode.geometry, this.material);
    sceneNode.name = geometryNode.name;
    sceneNode.position.copy(geometryNode.boundingBox.min);
    sceneNode.frustumCulled = false;
    sceneNode.onBeforeRender = (_this, scene, camera, geometry, material, group) => {
      if (material.program) {
        _this.getContext().useProgram(material.program.program);

        if (material.program.getUniforms().map.level) {
          const level = geometryNode.getLevel();
          material.uniforms.level.value = level;
          material.program.getUniforms().map.level.setValue(_this.getContext(), level);
        }

        if (this.visibleNodeTextureOffsets && material.program.getUniforms().map.vnStart) {
          const vnStart = this.visibleNodeTextureOffsets.get(node);
          material.uniforms.vnStart.value = vnStart;
          material.program.getUniforms().map.vnStart.setValue(_this.getContext(), vnStart);
        }

        if (material.program.getUniforms().map.pcIndex) {
          const i = node.pcIndex ? node.pcIndex : this.visibleNodes.indexOf(node);
          material.uniforms.pcIndex.value = i;
          material.program.getUniforms().map.pcIndex.setValue(_this.getContext(), i);
        }
      }
    };

    // { // DEBUG
    //	let sg = new THREE.SphereGeometry(1, 16, 16);
    //	let sm = new THREE.MeshNormalMaterial();
    //	let s = new THREE.Mesh(sg, sm);
    //	s.scale.set(5, 5, 5);
    //	s.position.copy(geometryNode.mean)
    //		.add(this.position)
    //		.add(geometryNode.boundingBox.min);
    //
    //	viewer.scene.scene.add(s);
    // }

    node.geometryNode = geometryNode;
    node.sceneNode = sceneNode;
    node.pointcloud = this;
    node.children = [];
    // for (let key in geometryNode.children) {
    //	node.children[key] = geometryNode.children[key];
    // }
    for (let i = 0; i < 8; i++) {
      node.children[i] = geometryNode.children[i];
    }

    if (!parent) {
      this.root = node;
      this.add(sceneNode);
    } else {
      const childIndex = parseInt(geometryNode.name[geometryNode.name.length - 1]);
      parent.sceneNode.add(sceneNode);
      parent.children[childIndex] = node;
    }

    const disposeListener = function () {
      const childIndex = parseInt(geometryNode.name[geometryNode.name.length - 1]);
      parent.sceneNode.remove(node.sceneNode);
      parent.children[childIndex] = geometryNode;
    };
    geometryNode.oneTimeDisposeHandlers.push(disposeListener);

    return node;
  }

  updateVisibleBounds() {
    const leafNodes = [];
    for (let i = 0; i < this.visibleNodes.length; i++) {
      const node = this.visibleNodes[i];
      let isLeaf = true;

      for (let j = 0; j < node.children.length; j++) {
        const child = node.children[j];
        if (child instanceof PointCloudOctreeNode) {
          isLeaf = isLeaf && !child.sceneNode.visible;
        } else if (child instanceof PointCloudOctreeGeometryNode) {
          isLeaf = true;
        }
      }

      if (isLeaf) {
        leafNodes.push(node);
      }
    }

    this.visibleBounds.min = new THREE.Vector3(Infinity, Infinity, Infinity);
    this.visibleBounds.max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < leafNodes.length; i++) {
      const node = leafNodes[i];

      this.visibleBounds.expandByPoint(node.getBoundingBox().min);
      this.visibleBounds.expandByPoint(node.getBoundingBox().max);
    }
  }

  updateMaterial(material, visibleNodes, camera, renderer) {
    material.fov = camera.fov * (Math.PI / 180);
    material.screenWidth = renderer.domElement.clientWidth;
    material.screenHeight = renderer.domElement.clientHeight;
    material.spacing = this.pcoGeometry.spacing * Math.max(this.scale.x, this.scale.y, this.scale.z);
    material.near = camera.near;
    material.far = camera.far;
    material.uniforms.octreeSize.value = this.pcoGeometry.boundingBox.getSize(new THREE.Vector3()).x;
  }

  computeVisibilityTextureData(nodes, camera) {
    // console.log('pointcloudoctree 184', camera);
    if (Potree.measureTimings) performance.mark('computeVisibilityTextureData-start');

    const data = new Uint8Array(nodes.length * 4);
    const visibleNodeTextureOffsets = new Map();

    // copy array
    nodes = nodes.slice();

    // sort by level and index, e.g. r, r0, r3, r4, r01, r07, r30, ...
    const sort = function (a, b) {
      const na = a.geometryNode.name;
      const nb = b.geometryNode.name;
      if (na.length !== nb.length) return na.length - nb.length;
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    };
    nodes.sort(sort);

    // code sample taken from three.js src/math/Ray.js
    const v1 = new THREE.Vector3();
    const intersectSphereBack = (ray, sphere) => {
      v1.subVectors(sphere.center, ray.origin);
      const tca = v1.dot(ray.direction);
      const d2 = v1.dot(v1) - tca * tca;
      const radius2 = sphere.radius * sphere.radius;

      if (d2 > radius2) {
        return null;
      }

      const thc = Math.sqrt(radius2 - d2);

      // t1 = second intersect point - exit point on back of sphere
      const t1 = tca + thc;

      if (t1 < 0) {
        return null;
      }

      return t1;
    };

    // const lodRanges = new Map();
    // const leafNodeLodRanges = new Map();

    // const bBox = new THREE.Box3();
    // const bSphere = new THREE.Sphere();
    // const worldDir = new THREE.Vector3();
    // const cameraRay = new THREE.Ray(camera.position, camera.getWorldDirection(worldDir));

    const nodeMap = new Map();
    const offsetsToChild = new Array(nodes.length).fill(Infinity);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      nodeMap.set(node.name, node);
      visibleNodeTextureOffsets.set(node, i);

      if (i > 0) {
        const index = parseInt(node.name.slice(-1));
        const parentName = node.name.slice(0, -1);
        const parent = nodeMap.get(parentName);
        const parentOffset = visibleNodeTextureOffsets.get(parent);

        const parentOffsetToChild = (i - parentOffset);

        offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);

        data[parentOffset * 4 + 0] = data[parentOffset * 4 + 0] | (1 << index);
        data[parentOffset * 4 + 1] = (offsetsToChild[parentOffset] >> 8);
        data[parentOffset * 4 + 2] = (offsetsToChild[parentOffset] % 256);
      }

      data[i * 4 + 3] = node.name.length - 1;
    }

    const a = 10;

    if (Potree.measureTimings) {
      performance.mark('computeVisibilityTextureData-end');
      performance.measure('render.computeVisibilityTextureData', 'computeVisibilityTextureData-start', 'computeVisibilityTextureData-end');
    }

    return {
      data,
      offsets: visibleNodeTextureOffsets,
    };
  }

  nodeIntersectsProfile(node, profile) {
    const bbWorld = node.boundingBox.clone().applyMatrix4(this.matrixWorld);
    const bsWorld = bbWorld.getBoundingSphere(new THREE.Sphere());

    let intersects = false;

    for (let i = 0; i < profile.points.length - 1; i++) {
      const start = new THREE.Vector3(profile.points[i + 0].x, profile.points[i + 0].y, bsWorld.center.z);
      const end = new THREE.Vector3(profile.points[i + 1].x, profile.points[i + 1].y, bsWorld.center.z);

      const closest = new THREE.Line3(start, end).closestPointToPoint(bsWorld.center, true, new THREE.Vector3());
      const distance = closest.distanceTo(bsWorld.center);

      intersects = intersects || (distance < (bsWorld.radius + profile.width));
    }

    // console.log(`${node.name}: ${intersects}`);

    return intersects;
  }

  nodesOnRay(nodes, ray) {
    const nodesOnRay = [];

    const _ray = ray.clone();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // let inverseWorld = new THREE.Matrix4().getInverse(node.matrixWorld);
      // let sphere = node.getBoundingSphere().clone().applyMatrix4(node.sceneNode.matrixWorld);
      const sphere = node.getBoundingSphere().clone().applyMatrix4(this.matrixWorld);

      if (_ray.intersectsSphere(sphere)) {
        nodesOnRay.push(node);
      }
    }

    return nodesOnRay;
  }

  updateMatrixWorld(force) {
    if (this.matrixAutoUpdate === true) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (!this.parent) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      force = true;
    }
  }

  hideDescendants(object) {
    const stack = [];
    for (let i = 0; i < object.children.length; i++) {
      const child = object.children[i];
      if (child.visible) {
        stack.push(child);
      }
    }

    while (stack.length > 0) {
      const object = stack.shift();

      object.visible = false;

      for (let i = 0; i < object.children.length; i++) {
        const child = object.children[i];
        if (child.visible) {
          stack.push(child);
        }
      }
    }
  }

  moveToOrigin() {
    this.position.set(0, 0, 0);
    this.updateMatrixWorld(true);
    const box = this.boundingBox;
    const transform = this.matrixWorld;
    const tBox = Utils.computeTransformedBoundingBox(box, transform);
    this.position.set(0, 0, 0).sub(tBox.getCenter(new THREE.Vector3()));
  }

  moveToGroundPlane() {
    this.updateMatrixWorld(true);
    const box = this.boundingBox;
    const transform = this.matrixWorld;
    const tBox = Utils.computeTransformedBoundingBox(box, transform);
    this.position.y += -tBox.min.y;
  }

  getBoundingBoxWorld() {
    this.updateMatrixWorld(true);
    const box = this.boundingBox;
    const transform = this.matrixWorld;
    const tBox = Utils.computeTransformedBoundingBox(box, transform);

    return tBox;
  }

  /**
   * returns points inside the profile points
   *
   * maxDepth:		search points up to the given octree depth
   *
   *
   * The return value is an array with all segments of the profile path
   *  let segment = {
   * 		start: 	THREE.Vector3,
   * 		end: 	THREE.Vector3,
   * 		points: {}
   * 		project: function()
   *  };
   *
   * The project() function inside each segment can be used to transform
   * that segments point coordinates to line up along the x-axis.
   *
   *
   */
  getPointsInProfile(profile, maxDepth, callback) {
    if (callback) {
      const request = new Potree.ProfileRequest(this, profile, maxDepth, callback);
      this.profileRequests.push(request);

      return request;
    }

    const points = {
      segments: [],
      boundingBox: new THREE.Box3(),
      projectedBoundingBox: new THREE.Box2(),
    };

    // evaluate segments
    for (let i = 0; i < profile.points.length - 1; i++) {
      const start = profile.points[i];
      const end = profile.points[i + 1];
      const ps = this.getProfile(start, end, profile.width, maxDepth);

      const segment = {
        start,
        end,
        points: ps,
        project: null,
      };

      points.segments.push(segment);

      points.boundingBox.expandByPoint(ps.boundingBox.min);
      points.boundingBox.expandByPoint(ps.boundingBox.max);
    }

    // add projection functions to the segments
    const mileage = new THREE.Vector3();
    for (let i = 0; i < points.segments.length; i++) {
      const segment = points.segments[i];
      const start = segment.start;
      const end = segment.end;

      const project = (function (_start, _end, _mileage, _boundingBox) {
        const start = _start;
        const end = _end;
        const mileage = _mileage;
        const boundingBox = _boundingBox;

        const xAxis = new THREE.Vector3(1, 0, 0);
        const dir = new THREE.Vector3().subVectors(end, start);
        dir.y = 0;
        dir.normalize();
        let alpha = Math.acos(xAxis.dot(dir));
        if (dir.z > 0) {
          alpha = -alpha;
        }

        return function (position) {
          const toOrigin = new THREE.Matrix4().makeTranslation(-start.x, -boundingBox.min.y, -start.z);
          const alignWithX = new THREE.Matrix4().makeRotationY(-alpha);
          const applyMileage = new THREE.Matrix4().makeTranslation(mileage.x, 0, 0);

          const pos = position.clone();
          pos.applyMatrix4(toOrigin);
          pos.applyMatrix4(alignWithX);
          pos.applyMatrix4(applyMileage);

          return pos;
        };
      }(start, end, mileage.clone(), points.boundingBox.clone()));

      segment.project = project;

      mileage.x += new THREE.Vector3(start.x, 0, start.z).distanceTo(new THREE.Vector3(end.x, 0, end.z));
      mileage.y += end.y - start.y;
    }

    points.projectedBoundingBox.min.x = 0;
    points.projectedBoundingBox.min.y = points.boundingBox.min.y;
    points.projectedBoundingBox.max.x = mileage.x;
    points.projectedBoundingBox.max.y = points.boundingBox.max.y;

    return points;
  }

  /**
   * returns points inside the given profile bounds.
   *
   * start:
   * end:
   * width:
   * depth:		search points up to the given octree depth
   * callback:	if specified, points are loaded before searching
   *
   *
   */
  getProfile(start, end, width, depth, callback) {
    const request = new Potree.ProfileRequest(start, end, width, depth, callback);
    this.profileRequests.push(request);
  }

  getVisibleExtent() {
    return this.visibleBounds.applyMatrix4(this.matrixWorld);
  }

  /**
   *
   *
   *
   * params.pickWindowSize:	Look for points inside a pixel window of this size.
   * 							Use odd values: 1, 3, 5, ...
   *
   *
   * TODO: only draw pixels that are actually read with readPixels().
   *
   */
  pick(viewer, camera, ray, params = {}) {
    const renderer = viewer.renderer;
    const pRenderer = viewer.pRenderer;

    performance.mark('pick-start');

    const getVal = (a, b) => (a !== undefined ? a : b);

    let pickWindowSize = getVal(params.pickWindowSize, 17);
    // const pickOutsideClipRegion = getVal(params.pickOutsideClipRegion, false);

    pickWindowSize = 65;

    const size = renderer.getSize();

    const width = Math.ceil(getVal(params.width, size.width));
    const height = Math.ceil(getVal(params.height, size.height));

    const pointSizeType = getVal(params.pointSizeType, this.material.pointSizeType);
    const pointSize = getVal(params.pointSize, this.material.size);

    const nodes = this.nodesOnRay(this.visibleNodes, ray);

    if (nodes.length === 0) {
      return null;
    }

    if (!this.pickState) {
      const scene = new THREE.Scene();

      const material = new Potree.PointCloudMaterial();
      material.pointColorType = Potree.PointColorType.POINT_INDEX;

      const renderTarget = new THREE.WebGLRenderTarget(
        1, 1,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat,
        },
      );

      this.pickState = {
        renderTarget,
        material,
        scene,
      };
    }

    const pickState = this.pickState;
    const pickMaterial = pickState.material;

    { // update pick material
      pickMaterial.pointSizeType = pointSizeType;
      pickMaterial.shape = this.material.shape;

      pickMaterial.size = pointSize;
      pickMaterial.uniforms.minSize.value = this.material.uniforms.minSize.value;
      pickMaterial.uniforms.maxSize.value = this.material.uniforms.maxSize.value;
      pickMaterial.classification = this.material.classification;
      if (params.pickClipped) {
        pickMaterial.clipBoxes = this.material.clipBoxes;
        if (this.material.clipTask === Potree.ClipTask.HIGHLIGHT) {
          pickMaterial.clipTask = Potree.ClipTask.NONE;
        } else {
          pickMaterial.clipTask = this.material.clipTask;
        }
      } else {
        pickMaterial.clipBoxes = [];
      }

      this.updateMaterial(pickMaterial, nodes, camera, renderer);
    }

    // pickMaterial.pointColorType = Potree.PointColorType.LOD;

    pickState.renderTarget.setSize(width, height);

    const pixelPos = new THREE.Vector2(params.x, params.y);

    const gl = renderer.getContext();
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(
      parseInt(pixelPos.x - (pickWindowSize - 1) / 2),
      parseInt(pixelPos.y - (pickWindowSize - 1) / 2),
      parseInt(pickWindowSize), parseInt(pickWindowSize));


    renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
    renderer.state.buffers.depth.setMask(pickMaterial.depthWrite);
    renderer.state.setBlending(THREE.NoBlending);

    { // RENDER
      renderer.setRenderTarget(pickState.renderTarget);
      gl.clearColor(0, 0, 0, 0);
      renderer.clearTarget(pickState.renderTarget, true, true, true);

      const tmp = this.material;
      this.material = pickMaterial;

      pRenderer.renderOctree(this, nodes, camera, pickState.renderTarget);

      this.material = tmp;
    }

    const clamp = (number, min, max) => Math.min(Math.max(min, number), max);

    const x = parseInt(clamp(pixelPos.x - (pickWindowSize - 1) / 2, 0, width));
    const y = parseInt(clamp(pixelPos.y - (pickWindowSize - 1) / 2, 0, height));
    const w = parseInt(Math.min(x + pickWindowSize, width) - x);
    const h = parseInt(Math.min(y + pickWindowSize, height) - y);

    const pixelCount = w * h;
    const buffer = new Uint8Array(4 * pixelCount);

    gl.readPixels(x, y, pickWindowSize, pickWindowSize, gl.RGBA, gl.UNSIGNED_BYTE, buffer);

    renderer.setRenderTarget(null);
    renderer.state.reset();
    renderer.setScissorTest(false);
    gl.disable(gl.SCISSOR_TEST);

    const pixels = buffer;
    const ibuffer = new Uint32Array(buffer.buffer);

    // find closest hit inside pixelWindow boundaries
    const min = Number.MAX_VALUE;
    const hits = [];
    for (let u = 0; u < pickWindowSize; u++) {
      for (let v = 0; v < pickWindowSize; v++) {
        const offset = (u + v * pickWindowSize);
        const distance = Math.pow(u - (pickWindowSize - 1) / 2, 2) + Math.pow(v - (pickWindowSize - 1) / 2, 2); //

        const pcIndex = pixels[4 * offset + 3];
        pixels[4 * offset + 3] = 0;
        const pIndex = ibuffer[offset];

        if (!(pcIndex === 0 && pIndex === 0) && (pcIndex !== undefined) && (pIndex !== undefined)) {
          const hit = {
            pIndex,
            pcIndex,
            distanceToCenter: distance,
          };

          if (params.all) {
            hits.push(hit);
          } else if (hits.length > 0) {
            if (distance < hits[0].distanceToCenter) {
              hits[0] = hit;
            }
          } else {
            hits.push(hit);
          }
        }
      }
    }

    // DEBUG: show panel with pick image
    // {
    //	let img = Utils.pixelsArrayToImage(buffer, w, h);
    //	let screenshot = img.src;
    //
    //	if(!this.debugDIV){
    //		this.debugDIV = $(`
    //			<div id="pickDebug"
    //			style="position: absolute;
    //			right: 400px; width: 300px;
    //			bottom: 44px; width: 300px;
    //			z-index: 1000;
    //			"></div>`);
    //		$(document.body).append(this.debugDIV);
    //	}
    //
    //	this.debugDIV.empty();
    //	this.debugDIV.append($(`<img src="${screenshot}"
    //		style="transform: scaleY(-1); width: 300px"/>`));
    //	//$(this.debugWindow.document).append($(`<img src="${screenshot}"/>`));
    //	//this.debugWindow.document.write('<img src="'+screenshot+'"/>');
    // }


    for (const hit of hits) {
      const point = {};

      if (!nodes[hit.pcIndex]) {
        return null;
      }

      const node = nodes[hit.pcIndex];
      const pc = node.sceneNode;
      const geometry = node.geometryNode.geometry;
      /* eslint-disable */
      for (const attributeName in geometry.attributes) {
        const attribute = geometry.attributes[attributeName];

        if (attributeName === 'position') {
          const x = attribute.array[3 * hit.pIndex + 0];
          const y = attribute.array[3 * hit.pIndex + 1];
          const z = attribute.array[3 * hit.pIndex + 2];

          const position = new THREE.Vector3(x, y, z);
          position.applyMatrix4(pc.matrixWorld);

          point[attributeName] = position;
        } else if (attributeName === 'indices') {

        } else {
          // if (values.itemSize === 1) {
          //	point[attribute.name] = values.array[hit.pIndex];
          // } else {
          //	let value = [];
          //	for (let j = 0; j < values.itemSize; j++) {
          //		value.push(values.array[values.itemSize * hit.pIndex + j]);
          //	}
          //	point[attribute.name] = value;
          // }
        }
      }
      /* eslint-enable */

      hit.point = point;
    }

    performance.mark('pick-end');
    performance.measure('pick', 'pick-start', 'pick-end');

    if (params.all) {
      return hits.map(hit => hit.point);
    }
    if (hits.length === 0) {
      return null;
    }
    return hits[0].point;
    // let sorted = hits.sort( (a, b) => a.distanceToCenter - b.distanceToCenter);

    // return sorted[0].point;
  }

  * getFittedBoxGen(boxNode) {
    const start = performance.now();

    const shrinkedLocalBounds = new THREE.Box3();
    const worldToBox = new THREE.Matrix4().getInverse(boxNode.matrixWorld);

    for (const node of this.visibleNodes) {
      if (!node.sceneNode) {
        continue;
      }

      const buffer = node.geometryNode.buffer;

      const posOffset = buffer.offset('position');
      const stride = buffer.stride;
      const view = new DataView(buffer.data);

      const objectToBox = new THREE.Matrix4().multiplyMatrices(worldToBox, node.sceneNode.matrixWorld);

      const pos = new THREE.Vector4();
      for (let i = 0; i < buffer.numElements; i++) {
        const x = view.getFloat32(i * stride + posOffset + 0, true);
        const y = view.getFloat32(i * stride + posOffset + 4, true);
        const z = view.getFloat32(i * stride + posOffset + 8, true);

        pos.set(x, y, z, 1);
        pos.applyMatrix4(objectToBox);

        if (pos.x > -0.5 && pos.x < 0.5) {
          if (pos.y > -0.5 && pos.y < 0.5) {
            if (pos.z > -0.5 && pos.z < 0.5) {
              shrinkedLocalBounds.expandByPoint(pos);
            }
          }
        }
      }

      yield;
    }

    const fittedPosition = shrinkedLocalBounds.getCenter(new THREE.Vector3()).applyMatrix4(boxNode.matrixWorld);

    const fitted = new THREE.Object3D();
    fitted.position.copy(fittedPosition);
    fitted.scale.copy(boxNode.scale);
    fitted.rotation.copy(boxNode.rotation);

    const ds = new THREE.Vector3().subVectors(shrinkedLocalBounds.max, shrinkedLocalBounds.min);
    fitted.scale.multiply(ds);

    const duration = performance.now() - start;
    console.log('duration: ', duration);

    yield fitted;
  }

  getFittedBox(boxNode, maxLevel = Infinity) {
    maxLevel = Infinity;

    const start = performance.now();

    const shrinkedLocalBounds = new THREE.Box3();
    const worldToBox = new THREE.Matrix4().getInverse(boxNode.matrixWorld);

    for (const node of this.visibleNodes) {
      if (!node.sceneNode || node.getLevel() > maxLevel) {
        continue;
      }

      const buffer = node.geometryNode.buffer;

      const posOffset = buffer.offset('position');
      const stride = buffer.stride;
      const view = new DataView(buffer.data);

      const objectToBox = new THREE.Matrix4().multiplyMatrices(worldToBox, node.sceneNode.matrixWorld);

      const pos = new THREE.Vector4();
      for (let i = 0; i < buffer.numElements; i++) {
        const x = view.getFloat32(i * stride + posOffset + 0, true);
        const y = view.getFloat32(i * stride + posOffset + 4, true);
        const z = view.getFloat32(i * stride + posOffset + 8, true);

        pos.set(x, y, z, 1);
        pos.applyMatrix4(objectToBox);

        if (pos.x > -0.5 && pos.x < 0.5) {
          if (pos.y > -0.5 && pos.y < 0.5) {
            if (pos.z > -0.5 && pos.z < 0.5) {
              shrinkedLocalBounds.expandByPoint(pos);
            }
          }
        }
      }
    }

    const fittedPosition = shrinkedLocalBounds.getCenter(new THREE.Vector3()).applyMatrix4(boxNode.matrixWorld);

    const fitted = new THREE.Object3D();
    fitted.position.copy(fittedPosition);
    fitted.scale.copy(boxNode.scale);
    fitted.rotation.copy(boxNode.rotation);

    const ds = new THREE.Vector3().subVectors(shrinkedLocalBounds.max, shrinkedLocalBounds.min);
    fitted.scale.multiply(ds);

    const duration = performance.now() - start;
    console.log('duration: ', duration);

    return fitted;
  }

  get progress() {
    return this.visibleNodes.length / this.visibleGeometry.length;
  }

  find(name) {
    let node = null;
    for (const char of name) {
      if (char === 'r') {
        node = this.root;
      } else {
        node = node.children[char];
      }
    }

    return node;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (value !== this._visible) {
      this._visible = value;

      this.dispatchEvent({ type: 'visibility_changed', pointcloud: this });
    }
  }
}

export default PointCloudOctree;
