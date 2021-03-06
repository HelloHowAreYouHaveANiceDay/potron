import EnumItem from './EnumItem';

class Enum {
  constructor(object) {
    this.object = object;

    for (const key of Object.keys(object)) {
      let value = object[key];

      if (typeof value === 'object') {
        value.name = key;
      } else {
        value = { name: key, value };
      }

      this[key] = new EnumItem(value);
    }
  }

  fromValue(value) {
    for (const key of Object.keys(this.object)) {
      if (this[key].value === value) {
        return this[key];
      }
    }

    throw new Error(`No enum for value: ${value}`);
  }
}

export default Enum;
