
export default class EventDispatcher {

  constructor() {
    this._listeners = {};
  }

  addEventListener(type, listener) {

    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === - 1) {
      listeners[type].push(listener);
    }

  }

  hasEventListener(type, listener) {

    const listeners = this._listeners;

    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1;
  }

  removeEventListener(type, listener) {

    let listeners = this._listeners;
    let listenerArray = listeners[type];

    if (listenerArray !== undefined) {

      let index = listenerArray.indexOf(listener);

      if (index !== - 1) {
        listenerArray.splice(index, 1);
      }
    }

  }

  removeEventListeners(type) {
    if (this._listeners[type] !== undefined) {
      delete this._listeners[type];
    }
  };

  dispatchEvent(event) {

    let listeners = this._listeners;
    let listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      event.target = this;

      for (let listener of listenerArray.slice(0)) {
        listener.call(this, event);
      }
    }

  }

}
