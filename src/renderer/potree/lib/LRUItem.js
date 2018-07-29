class LRUItem {
  constructor(node) {
    this.previous = null;
    this.next = null;
    this.node = node;
  }
}

export default LRUItem;
