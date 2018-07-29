import GreyhoundLoader from './loaders/GreyhoundLoader';
import POCLoader from './loaders/POCLoader';
import PointCloudOctree from './PointCloudOctree';
import PointCloudArena4D from './PointCloudArena4D';
import PointCloudArena4DGeometry from './PointCloudArena4DGeometry';

const LoadPointCloud = (path, name) => new Promise((resolve, reject) => {
  if (!path) {
    reject(new Error('no pointcloud path'));
  } else if (path.indexOf('greyhound://') === 0) {
    GreyhoundLoader.load(path, (geometry) => {
      if (!geometry) {
        reject(new Error(`failed to load point cloud from URL: ${path}`));
      } else {
        const pointcloud = new PointCloudOctree(geometry);
        resolve({
          type: 'pointcloud_loaded',
          name,
          pointcloud,
        });
      }
    });
  } else if (path.indexOf('cloud.js') > 0) {
    POCLoader.load(path, (geometry) => {
      if (!geometry) {
        reject(new Error(`failed to load point cloud from URL: ${path}`));
      } else {
        const pointcloud = new PointCloudOctree(geometry);
        resolve({
          type: 'pointcloud_loaded',
          name,
          pointcloud,
        });
      }
    });
  } else if (path.indexOf('.vpc') > 0) {
    PointCloudArena4DGeometry.load(path, (geometry) => {
      if (!geometry) {
        reject(new Error(`failed to load point cloud from URL: ${path}`));
      } else {
        const pointcloud = new PointCloudArena4D(geometry);
        resolve({
          type: 'pointcloud_loaded',
          name,
          pointcloud,
        });
      }
    });
  } else {
    reject(new Error(`failed to load point cloud from URL: ${path}`));
  }
});


export default LoadPointCloud;
