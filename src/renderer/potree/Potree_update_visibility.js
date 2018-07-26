import * as THREE from 'three';

import { ClipTask, ClipMethod } from './defines';
import { Box3Helper } from './utils/Box3Helper';
import BinaryHeap from './lib/BinaryHeap';
import Potree from './Potree';

export function updatePointClouds(pointclouds, camera, renderer) {
  for (const pointcloud of pointclouds) {
    const start = performance.now();

    for (const profileRequest of pointcloud.profileRequests) {
      profileRequest.update();

      const duration = performance.now() - start;
      if (duration > 5) {
        break;
      }
    }

    // const duration = performance.now() - start;
  }

  const result = updateVisibility(pointclouds, camera, renderer); // eslint-disable-line

  for (const pointcloud of pointclouds) {
    pointcloud.updateMaterial(pointcloud.material, pointcloud.visibleNodes, camera, renderer);
    pointcloud.updateVisibleBounds();
  }

  exports.lru.freeMemory();

  return result;
}


export function updateVisibilityStructures(pointclouds, camera, renderer) {
  console.log(renderer);
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


export function updateVisibility(pointclouds, camera, renderer) {
  // const numVisibleNodes = 0;
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

  // const domWidth = renderer.domElement.clientWidth;
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
        console.log(clipBox);
        const pcWorldInverse = new THREE.Matrix4().getInverse(pointcloud.matrixWorld);
        // const toPCObject = pcWorldInverse.multiply(clipBox.box.matrixWorld);

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

