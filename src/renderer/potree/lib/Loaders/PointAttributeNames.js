const PointAttributeNames = {
  POSITION_CARTESIAN: 0, // float x, y, z;
  COLOR_PACKED: 1, // byte r, g, b, a; 	I: [0,1]
  COLOR_FLOATS_1: 2, // float r, g, b; 	I: [0,1]
  COLOR_FLOATS_255: 3, // float r, g, b; 	I: [0,255]
  NORMAL_FLOATS: 4, // float x, y, z;
  FILLER: 5,
  INTENSITY: 6,
  CLASSIFICATION: 7,
  NORMAL_SPHEREMAPPED: 8,
  NORMAL_OCT16: 9,
  NORMAL: 10,
  RETURN_NUMBER: 11,
  NUMBER_OF_RETURNS: 12,
  SOURCE_ID: 13,
  INDICES: 14,
  SPACING: 15,
  GPS_TIME: 16,
};

export default PointAttributeNames;
