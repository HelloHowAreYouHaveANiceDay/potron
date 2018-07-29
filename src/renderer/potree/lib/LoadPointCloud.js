import GreyhoundLoader from './GreyhoundLoader';
import POCLoader from './POCLoader';
import PointCloudOctree from './PointCloudOctree';
import PointCloudArena4D from './PointCloudArena4D';
import PointCloudArena4DGeometry from './PointCloudArena4DGeometry';

function LoadPointCloud(path, name, callback) {
  const loaded = (pointcloud) => {
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

export default LoadPointCloud;
