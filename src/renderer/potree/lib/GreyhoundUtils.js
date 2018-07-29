/**
 * @class Loads greyhound metadata and returns a PointcloudOctree
 *
 * @author Maarten van Meersbergen
 * @author Oscar Martinez Rubi
 * @author Connor Manning
 */

import XHRFactory from './XHRFactory';

export default class GreyhoundUtils {
  static getQueryParam(name) {
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  static createSchema(attributes) {
    const schema = [
      { name: 'X', size: 4, type: 'signed' },
      { name: 'Y', size: 4, type: 'signed' },
      { name: 'Z', size: 4, type: 'signed' },
    ];

    // Once we include options in the UI to load a dynamic list of available
    // attributes for visualization (f.e. Classification, Intensity etc.)
    // we will be able to ask for that specific attribute from the server,
    // where we are now requesting all attributes for all points all the time.
    // If we do that though, we also need to tell Potree to redraw the points
    // that are already loaded (with different attributes).
    // This is not default behaviour.
    attributes.forEach((item) => {
      if (item === 'COLOR_PACKED') {
        schema.push({ name: 'Red', size: 2, type: 'unsigned' });
        schema.push({ name: 'Green', size: 2, type: 'unsigned' });
        schema.push({ name: 'Blue', size: 2, type: 'unsigned' });
      } else if (item === 'INTENSITY') {
        schema.push({ name: 'Intensity', size: 2, type: 'unsigned' });
      } else if (item === 'CLASSIFICATION') {
        schema.push({ name: 'Classification', size: 1, type: 'unsigned' });
      }
    });

    return schema;
  }

  static fetch(url, cb) {
    const xhr = XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          cb(null, xhr.responseText);
        } else {
          cb(xhr.responseText);
        }
      }
    };
    xhr.send(null);
  }

  static fetchBinary(url, cb) {
    const xhr = XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          cb(null, xhr.response);
        } else {
          cb(xhr.responseText);
        }
      }
    };
    xhr.send(null);
  }

  static pointSizeFrom(schema) {
    return schema.reduce((p, c) => p + c.size, 0);
  }

  static getNormalization(serverURL, baseDepth, cb) {
    const s = [
      { name: 'X', size: 4, type: 'floating' },
      { name: 'Y', size: 4, type: 'floating' },
      { name: 'Z', size: 4, type: 'floating' },
      { name: 'Red', size: 2, type: 'unsigned' },
      { name: 'Green', size: 2, type: 'unsigned' },
      { name: 'Blue', size: 2, type: 'unsigned' },
      { name: 'Intensity', size: 2, type: 'unsigned' },
    ];

    const url = `${serverURL}read?depth=${baseDepth
    }&schema=${JSON.stringify(s)}`;

    GreyhoundUtils.fetchBinary(url, (err, buffer) => {
      if (err) throw new Error(err);

      const view = new DataView(buffer);
      const numBytes = buffer.byteLength - 4;
      // TODO Unused: let numPoints = view.getUint32(numBytes, true);
      const pointSize = GreyhoundUtils.pointSizeFrom(s);

      let colorNorm = false;
      let intensityNorm = false;

      for (let offset = 0; offset < numBytes; offset += pointSize) {
        if (view.getUint16(offset + 12, true) > 255 ||
          view.getUint16(offset + 14, true) > 255 ||
          view.getUint16(offset + 16, true) > 255) {
          colorNorm = true;
        }

        if (view.getUint16(offset + 18, true) > 255) {
          intensityNorm = true;
        }

        if (colorNorm && intensityNorm) break;
      }

      if (colorNorm) console.log('Normalizing color');
      if (intensityNorm) console.log('Normalizing intensity');

      cb(null, { color: colorNorm, intensity: intensityNorm });
    });
  }
}
