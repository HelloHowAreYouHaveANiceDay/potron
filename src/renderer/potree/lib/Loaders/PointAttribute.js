import PointAttributeNames from './PointAttributeNames';
import PointAttributeTypes from './PointAttributeTypes';

class PointAttribute {
  constructor(name, type, numElements) {
    this.name = name;
    this.type = type;
    this.numElements = numElements;
    this.byteSize = this.numElements * this.type.size;
  }
}

PointAttribute.POSITION_CARTESIAN = new PointAttribute(
  PointAttributeNames.POSITION_CARTESIAN,
  PointAttributeTypes.DATA_TYPE_FLOAT, 3);

PointAttribute.RGBA_PACKED = new PointAttribute(
  PointAttributeNames.COLOR_PACKED,
  PointAttributeTypes.DATA_TYPE_INT8, 4);

PointAttribute.COLOR_PACKED = PointAttribute.RGBA_PACKED;

PointAttribute.RGB_PACKED = new PointAttribute(
  PointAttributeNames.COLOR_PACKED,
  PointAttributeTypes.DATA_TYPE_INT8, 3);

PointAttribute.NORMAL_FLOATS = new PointAttribute(
  PointAttributeNames.NORMAL_FLOATS,
  PointAttributeTypes.DATA_TYPE_FLOAT, 3);

PointAttribute.FILLER_1B = new PointAttribute(
  PointAttributeNames.FILLER,
  PointAttributeTypes.DATA_TYPE_UINT8, 1);

PointAttribute.INTENSITY = new PointAttribute(
  PointAttributeNames.INTENSITY,
  PointAttributeTypes.DATA_TYPE_UINT16, 1);

PointAttribute.CLASSIFICATION = new PointAttribute(
  PointAttributeNames.CLASSIFICATION,
  PointAttributeTypes.DATA_TYPE_UINT8, 1);

PointAttribute.NORMAL_SPHEREMAPPED = new PointAttribute(
  PointAttributeNames.NORMAL_SPHEREMAPPED,
  PointAttributeTypes.DATA_TYPE_UINT8, 2);

PointAttribute.NORMAL_OCT16 = new PointAttribute(
  PointAttributeNames.NORMAL_OCT16,
  PointAttributeTypes.DATA_TYPE_UINT8, 2);

PointAttribute.NORMAL = new PointAttribute(
  PointAttributeNames.NORMAL,
  PointAttributeTypes.DATA_TYPE_FLOAT, 3);

PointAttribute.RETURN_NUMBER = new PointAttribute(
  PointAttributeNames.RETURN_NUMBER,
  PointAttributeTypes.DATA_TYPE_UINT8, 1);

PointAttribute.NUMBER_OF_RETURNS = new PointAttribute(
  PointAttributeNames.NUMBER_OF_RETURNS,
  PointAttributeTypes.DATA_TYPE_UINT8, 1);

PointAttribute.SOURCE_ID = new PointAttribute(
  PointAttributeNames.SOURCE_ID,
  PointAttributeTypes.DATA_TYPE_UINT16, 1);

PointAttribute.INDICES = new PointAttribute(
  PointAttributeNames.INDICES,
  PointAttributeTypes.DATA_TYPE_UINT32, 1);

PointAttribute.SPACING = new PointAttribute(
  PointAttributeNames.SPACING,
  PointAttributeTypes.DATA_TYPE_FLOAT, 1);

PointAttribute.GPS_TIME = new PointAttribute(
  PointAttributeNames.GPS_TIME,
  PointAttributeTypes.DATA_TYPE_DOUBLE, 1);

export default PointAttribute;
