// THIS MODULE LOADS THE POINTCLOUD
import * as THREE from 'three';

import PointAttribute from './PointAttribute';
import PointAttributes from './PointAttributes';
import XHRFactory from './XHRFactory';
import PointCloudOctreeGeometryNode from './PointCloudOctreeGeometryNode';
import PointCloudOctreeGeometry from './PointCloudOctreeGeometry';
import Version from './Version';
import LasLazLoader from './LasLazLoader';
import BinaryLoader from './BinaryLoader';
import Utils from './Utils';

export default class POCLoader {
  static load(url, callback) {
    try {
      const pco = new PointCloudOctreeGeometry();
      pco.url = url;
      const xhr = XHRFactory.createXMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
          const fMno = JSON.parse(xhr.responseText);

          const version = new Version(fMno.version);

          // assume octreeDir is absolute if it starts with http
          if (fMno.octreeDir.indexOf('http') === 0) {
            pco.octreeDir = fMno.octreeDir;
          } else {
            pco.octreeDir = `${url}/../${fMno.octreeDir}`;
          }

          pco.spacing = fMno.spacing;
          pco.hierarchyStepSize = fMno.hierarchyStepSize;

          pco.pointAttributes = fMno.pointAttributes;

          const min = new THREE.Vector3(fMno.boundingBox.lx, fMno.boundingBox.ly, fMno.boundingBox.lz);
          const max = new THREE.Vector3(fMno.boundingBox.ux, fMno.boundingBox.uy, fMno.boundingBox.uz);
          const boundingBox = new THREE.Box3(min, max);
          const tightBoundingBox = boundingBox.clone();

          if (fMno.tightBoundingBox) {
            tightBoundingBox.min.copy(new THREE.Vector3(fMno.tightBoundingBox.lx, fMno.tightBoundingBox.ly, fMno.tightBoundingBox.lz));
            tightBoundingBox.max.copy(new THREE.Vector3(fMno.tightBoundingBox.ux, fMno.tightBoundingBox.uy, fMno.tightBoundingBox.uz));
          }

          const offset = min.clone();

          boundingBox.min.sub(offset);
          boundingBox.max.sub(offset);

          tightBoundingBox.min.sub(offset);
          tightBoundingBox.max.sub(offset);

          pco.projection = fMno.projection;
          pco.boundingBox = boundingBox;
          pco.tightBoundingBox = tightBoundingBox;
          pco.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
          pco.tightBoundingSphere = tightBoundingBox.getBoundingSphere(new THREE.Sphere());
          pco.offset = offset;
          if (fMno.pointAttributes === 'LAS') {
            pco.loader = new LasLazLoader(fMno.version);
          } else if (fMno.pointAttributes === 'LAZ') {
            pco.loader = new LasLazLoader(fMno.version);
          } else {
            pco.loader = new BinaryLoader(fMno.version, boundingBox, fMno.scale);
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
              root.numPoints = fMno.hierarchy[0][1];
            } else {
              root.numPoints = 0;
            }
            pco.root = root;
            pco.root.load();
            nodes[name] = root;
          }

          // load remaining hierarchy
          if (version.upTo('1.4')) {
            for (let i = 1; i < fMno.hierarchy.length; i++) {
              const name = fMno.hierarchy[i][0];
              const numPoints = fMno.hierarchy[i][1];
              const index = parseInt(name.charAt(name.length - 1));
              const parentName = name.substring(0, name.length - 1);
              const parentNode = nodes[parentName];
              const level = name.length - 1;
              // let boundingBox = POCLoader.createChildAABB(parentNode.boundingBox, index);
              const boundingBox = Utils.createChildAABB(parentNode.boundingBox, index);

              const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
              node.level = level;
              node.numPoints = numPoints;
              node.spacing = pco.spacing / Math.pow(2, level);
              parentNode.addChild(node);
              nodes[name] = node;
            }
          }

          pco.nodes = nodes;

          callback(pco);
        }
      };

      xhr.send(null);
    } catch (e) {
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
