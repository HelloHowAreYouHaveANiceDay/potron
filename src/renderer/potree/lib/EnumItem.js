class EnumItem {
  constructor(object) {
    for (const key of Object.keys(object)) {
      this[key] = object[key];
    }
  }

  inspect() {
    return `Enum(${this.name}: ${this.value})`;
  }
}

export default EnumItem;
