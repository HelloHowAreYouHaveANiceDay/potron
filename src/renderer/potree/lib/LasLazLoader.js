

import Version from './Version';
import XHRFactory from './XHRFactory';
import LasLazBatcher from './LasLazBatcher';
import { LASFile, LASDecoder } from '../laslaz';

export default class LasLazLoader {
  constructor(version) {
    if (typeof (version) === 'string') {
      this.version = new Version(version);
    } else {
      this.version = version;
    }
  }

  static progressCB() {

  }

  load(node) {
    if (node.loaded) {
      return;
    }

    const pointAttributes = node.pcoGeometry.pointAttributes;

    let url = node.getURL();

    if (this.version.equalOrHigher('1.4')) {
      url += `.${pointAttributes.toLowerCase()}`;
    }

    const xhr = XHRFactory.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const buffer = xhr.response;
          this.parse(node, buffer);
        } else {
          console.log(`Failed to load file! HTTP status: ${xhr.status}, file: ${url}`);
        }
      }
    };

    xhr.send(null);
  }

  parse(node, buffer) {
    const lf = new LASFile(buffer);
    const handler = new LasLazBatcher(node);


    //
    // DEBUG
    //
    // invoke the laz decompress worker thousands of times to check for memory leaks
    // until 2018/03/05, it tended to run out of memory at ~6230 invocations
    //
    //
    // lf.open()
    // .then( msg => {
    //	lf.isOpen = true;
    //	return lf;
    // }).catch( msg => {
    //	console.log("failed to open file. :(");
    // }).then( lf => {
    //	return lf.getHeader().then(function (h) {
    //		return [lf, h];
    //	});
    // }).then( v => {
    //	let lf = v[0];
    //	let header = v[1];

    //	lf.readData(1000000, 0, 1)
    //	.then( v => {
    //		console.log("read");

    //		this.parse(node, buffer);
    //	}).then (v => {
    //		lf.close();
    //	});

    // })


    lf.open()
      .then(() => {
        lf.isOpen = true;
        return lf;
      }).catch(() => {
        console.log('failed to open file. :(');
      }).then(lf => lf.getHeader().then(h => [lf, h]))
      .then((v) => {
        const lf = v[0];
        const header = v[1];

        const skip = 1;
        let totalRead = 0;
        const totalToRead = (skip <= 1 ? header.pointsCount : header.pointsCount / skip);
        const reader = function () {
          const p = lf.readData(1000000, 0, skip);
          return p.then((data) => {
            handler.push(new LASDecoder(data.buffer,
              header.pointsFormatId,
              header.pointsStructSize,
              data.count,
              header.scale,
              header.offset,
              header.mins, header.maxs));

            totalRead += data.count;
            LasLazLoader.progressCB(totalRead / totalToRead);

            if (data.hasMoreData) {
              return reader();
            }
            header.totalRead = totalRead;
            header.versionAsString = lf.versionAsString;
            header.isCompressed = lf.isCompressed;
            return [lf, header, handler];
          });
        };

        return reader();
      })
      .then((v) => {
        const lf = v[0];
        // we're done loading this file
        //
        LasLazLoader.progressCB(1);

        // Close it
        return lf.close().then(() => {
          lf.isOpen = false;

          return v.slice(1);
        }).catch((e) => {
          // If there was a cancellation, make sure the file is closed, if the file is open
          // close and then fail
          if (lf.isOpen) {
            return lf.close().then(() => {
              lf.isOpen = false;
              throw e;
            });
          }
          throw e;
        });
      });
  }

  handle() {

  }
}
