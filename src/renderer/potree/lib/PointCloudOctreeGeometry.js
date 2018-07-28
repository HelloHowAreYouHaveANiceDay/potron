class PointCloudOctreeGeometry {
  constructor() {
    this.url = null;
    this.octreeDir = null;
    this.spacing = 0;
    this.boundingBox = null;
    this.root = null;
    this.nodes = null;
    this.pointAttributes = null;
    this.hierarchyStepSize = -1;
    this.loader = null;
  }
}

export default PointCloudOctreeGeometry;
