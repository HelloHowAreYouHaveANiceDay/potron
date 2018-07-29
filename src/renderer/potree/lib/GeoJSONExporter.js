/**
   *
   * @author sigeom sa / http://sigeom.ch
   * @author Ioda-Net Sàrl / https://www.ioda-net.ch/
   * @author Markus Schütz / http://potree.org
   *
   */

import Measure from './Measure';

export default class GeoJSONExporter {
  static measurementToFeatures(measurement) {
    const coords = measurement.points.map(e => e.position.toArray());

    const features = [];

    if (coords.length === 1) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords[0], // was coards[0]
        },
        properties: {
          name: measurement.name,
        },
      };
      features.push(feature);
    } else if (coords.length > 1 && !measurement.closed) {
      const object = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
        properties: {
          name: measurement.name,
        },
      };

      features.push(object);
    } else if (coords.length > 1 && measurement.closed) {
      const object = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...coords, coords[0]]],
        },
        properties: {
          name: measurement.name,
        },
      };
      features.push(object);
    }

    if (measurement.showDistances) {
      measurement.edgeLabels.forEach((label) => {
        const labelPoint = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: label.position.toArray(),
          },
          properties: {
            distance: label.text,
          },
        };
        features.push(labelPoint);
      });
    }

    if (measurement.showArea) {
      const point = measurement.areaLabel.position;
      const labelArea = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: point.toArray(),
        },
        properties: {
          area: measurement.areaLabel.text,
        },
      };
      features.push(labelArea);
    }

    return features;
  }

  static toString(measurements) {
    if (!(measurements instanceof Array)) {
      measurements = [measurements];
    }

    measurements = measurements.filter(m => m instanceof Measure);

    let features = [];
    for (const measure of measurements) {
      const f = GeoJSONExporter.measurementToFeatures(measure);

      features = features.concat(f);
    }

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    return JSON.stringify(geojson, null, '\t');
  }
}
