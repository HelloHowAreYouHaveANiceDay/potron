// THIS MODULE LOADS THE POINTCLOUD
import * as THREE from 'three';

import PointAttribute from './PointAttribute';
import PointAttributes from './PointAttributes';
import LasLazLoader from './LasLazLoader';
import BinaryLoader from './BinaryLoader';

import PointCloudOctreeGeometryNode from '../PointCloudOctreeGeometryNode';
import PointCloudOctreeGeometry from '../PointCloudOctreeGeometry';
import XHRFactory from '../XHRFactory';
import Version from '../Version';
// import Utils from '../Utils';
// import VueEventBus from '../../VueEventBus';

export default class POCLoader {
  // load from a cloud.js file
  static load(url, callback) {
    // START OF TRY
    try {
      const pco = new PointCloudOctreeGeometry();
      pco.url = url;
      const xhr = XHRFactory.createXMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onreadystatechange = () => {
        // STATE 4 is DONE loading
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
          const pcConfig = JSON.parse(xhr.responseText);

          const version = new Version(pcConfig.version);

          // assume octreeDir is absolute if it starts with http
          if (pcConfig.octreeDir.indexOf('http') === 0) {
            pco.octreeDir = pcConfig.octreeDir;
          } else {
            pco.octreeDir = `${url}/../${pcConfig.octreeDir}`;
          }

          pco.spacing = pcConfig.spacing;
          pco.hierarchyStepSize = pcConfig.hierarchyStepSize;
          // PointAtrributes are listed in PointAttributeNames;
          pco.pointAttributes = pcConfig.pointAttributes;

          const min = new THREE.Vector3(pcConfig.boundingBox.lx, pcConfig.boundingBox.ly, pcConfig.boundingBox.lz);
          const max = new THREE.Vector3(pcConfig.boundingBox.ux, pcConfig.boundingBox.uy, pcConfig.boundingBox.uz);
          const boundingBox = new THREE.Box3(min, max);
          const tightBoundingBox = boundingBox.clone();

          if (pcConfig.tightBoundingBox) {
            tightBoundingBox.min.copy(new THREE.Vector3(pcConfig.tightBoundingBox.lx, pcConfig.tightBoundingBox.ly, pcConfig.tightBoundingBox.lz));
            tightBoundingBox.max.copy(new THREE.Vector3(pcConfig.tightBoundingBox.ux, pcConfig.tightBoundingBox.uy, pcConfig.tightBoundingBox.uz));
          }

          const offset = min.clone();

          boundingBox.min.sub(offset);
          boundingBox.max.sub(offset);

          tightBoundingBox.min.sub(offset);
          tightBoundingBox.max.sub(offset);

          pco.projection = pcConfig.projection;
          pco.boundingBox = boundingBox;
          pco.tightBoundingBox = tightBoundingBox;
          pco.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
          pco.tightBoundingSphere = tightBoundingBox.getBoundingSphere(new THREE.Sphere());
          pco.offset = offset;
          if (pcConfig.pointAttributes === 'LAS') {
            pco.loader = new LasLazLoader(pcConfig.version);
          } else if (pcConfig.pointAttributes === 'LAZ') {
            pco.loader = new LasLazLoader(pcConfig.version);
          } else {
            pco.loader = new BinaryLoader(pcConfig.version, boundingBox, pcConfig.scale);
            pco.pointAttributes = new PointAttributes(pco.pointAttributes);
          }

          const nodes = {};

          { // load root
            const name = 'r';
            const root = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
            root.level = 0;
            root.hasChildren = true;
            root.spacing = pco.spacing;
            if (version.upTo('1.5')) {
              root.numPoints = pcConfig.hierarchy[0][1];
            } else {
              root.numPoints = 0;
            }
            pco.root = root;
            pco.root.load();
            nodes[name] = root;
          }
          
          pco.nodes = nodes;
          // console.log('nodes', pco.nodes);
          callback(pco);
        }
      };

      xhr.send(null);
    } catch (e) {
      // END OF TRY CATCH

      console.log(`loading failed: '${url}'`);
      console.log(e);

      callback();
    }
  }

  loadPointAttributes(mno) {
    const fpa = mno.pointAttributes;
    const pa = new PointAttributes();

    for (let i = 0; i < fpa.length; i++) {
      const pointAttribute = PointAttribute[fpa[i]];
      pa.add(pointAttribute);
    }

    return pa;
  }

  createChildAABB(aabb, index) {
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
}
