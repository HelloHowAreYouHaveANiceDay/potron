import PointAttribute from './PointAttribute';
import PointAttributeNames from './PointAttributeNames';

export default class PointAttributes {
  constructor(pointAttributes) {
    this.attributes = [];
    this.byteSize = 0;
    this.size = 0;

    if (pointAttributes != null) {
      for (let i = 0; i < pointAttributes.length; i++) {
        const pointAttributeName = pointAttributes[i];
        const pointAttribute = PointAttribute[pointAttributeName];
        this.attributes.push(pointAttribute);
        this.byteSize += pointAttribute.byteSize;
        this.size++;
      }
    }
  }


  add(pointAttribute) {
    this.attributes.push(pointAttribute);
    this.byteSize += pointAttribute.byteSize;
    this.size++;
  }

  hasColors() {
    for (const name in this.attributes) {
      const pointAttribute = this.attributes[name];
      if (pointAttribute.name === PointAttributeNames.COLOR_PACKED) {
        return true;
      }
    }

    return false;
  }

  hasNormals() {
    for (const name in this.attributes) {
      const pointAttribute = this.attributes[name];
      if (
        pointAttribute === PointAttribute.NORMAL_SPHEREMAPPED ||
        pointAttribute === PointAttribute.NORMAL_FLOATS ||
        pointAttribute === PointAttribute.NORMAL ||
        pointAttribute === PointAttribute.NORMAL_OCT16) {
        return true;
      }
    }

    return false;
  }
}
