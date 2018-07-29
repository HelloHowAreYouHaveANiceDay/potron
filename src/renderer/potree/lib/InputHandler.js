import * as THREE from 'three';
import KeyCodes from './KeyCodes';
import EventDispatcher from './EventDispatcher';
import Utils from './Utils';

export default class InputHandler extends EventDispatcher {
  constructor(viewer) {
    super();

    this.viewer = viewer;
    this.renderer = viewer.renderer;
    this.domElement = this.renderer.domElement;
    this.enabled = true;

    this.scene = null;
    this.interactiveScenes = [];
    this.interactiveObjects = new Set();
    this.inputListeners = [];
    this.blacklist = new Set();

    this.drag = null;
    this.mouse = new THREE.Vector2(0, 0);

    this.selection = [];

    this.hoveredElements = [];
    this.pressedKeys = {};

    this.wheelDelta = 0;

    this.speed = 1;

    this.logMessages = false;

    if (this.domElement.tabIndex === -1) {
      this.domElement.tabIndex = 2222;
    }

    this.domElement.addEventListener('contextmenu', (event) => { event.preventDefault(); }, false);
    this.domElement.addEventListener('click', this.onMouseClick.bind(this), false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
    this.domElement.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false); // Firefox
    this.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this));
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this));
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this));
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
  }

  addInputListener(listener) {
    this.inputListeners.push(listener);
  }

  removeInputListener(listener) {
    this.inputListeners = this.inputListeners.filter(e => e !== listener);
  }

  getSortedListeners() {
    return this.inputListeners.sort((a, b) => {
      const ia = (a.importance !== undefined) ? a.importance : 0;
      const ib = (b.importance !== undefined) ? b.importance : 0;

      return ib - ia;
    });
  }

  onTouchStart(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onTouchStart`);

    e.preventDefault();

    if (e.touches.length === 1) {
      const rect = this.domElement.getBoundingClientRect();
      const x = e.touches[0].pageX - rect.left;
      const y = e.touches[0].pageY - rect.top;
      this.mouse.set(x, y);

      this.startDragging(null);
    }


    for (const inputListener of this.getSortedListeners()) {
      inputListener.dispatchEvent({
        type: e.type,
        touches: e.touches,
        changedTouches: e.changedTouches,
      });
    }
  }

  onTouchEnd(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onTouchEnd`);

    e.preventDefault();

    for (const inputListener of this.getSortedListeners()) {
      inputListener.dispatchEvent({
        type: 'drop',
        drag: this.drag,
        viewer: this.viewer,
      });
    }

    this.drag = null;

    for (const inputListener of this.getSortedListeners()) {
      inputListener.dispatchEvent({
        type: e.type,
        touches: e.touches,
        changedTouches: e.changedTouches,
      });
    }
  }

  onTouchMove(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onTouchMove`);

    e.preventDefault();

    if (e.touches.length === 1) {
      const rect = this.domElement.getBoundingClientRect();
      const x = e.touches[0].pageX - rect.left;
      const y = e.touches[0].pageY - rect.top;
      this.mouse.set(x, y);

      if (this.drag) {
        this.drag.mouse = 1;

        this.drag.lastDrag.x = x - this.drag.end.x;
        this.drag.lastDrag.y = y - this.drag.end.y;

        this.drag.end.set(x, y);

        if (this.logMessages) console.log(`${this.constructor.name}: drag: `);
        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: 'drag',
            drag: this.drag,
            viewer: this.viewer,
          });
        }
      }
    }

    for (const inputListener of this.getSortedListeners()) {
      inputListener.dispatchEvent({
        type: e.type,
        touches: e.touches,
        changedTouches: e.changedTouches,
      });
    }

    // DEBUG CODE
    // let debugTouches = [...e.touches, {
    //	pageX: this.domElement.clientWidth / 2,
    //	pageY: this.domElement.clientHeight / 2}];
    // for(let inputListener of this.getSortedListeners()){
    //	inputListener.dispatchEvent({
    //		type: e.type,
    //		touches: debugTouches,
    //		changedTouches: e.changedTouches
    //	});
    // }
  }

  onKeyDown(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onKeyDown`);

    // DELETE
    if (e.keyCode === KeyCodes.DELETE && this.selection.length > 0) {
      this.dispatchEvent({
        type: 'delete',
        selection: this.selection,
      });

      this.deselectAll();
    }

    this.dispatchEvent({
      type: 'keydown',
      keyCode: e.keyCode,
      event: e,
    });

    // for(let l of this.getSortedListeners()){
    //	l.dispatchEvent({
    //		type: "keydown",
    //		keyCode: e.keyCode,
    //		event: e
    //	});
    // }

    this.pressedKeys[e.keyCode] = true;

    // e.preventDefault();
  }

  onKeyUp(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onKeyUp`);

    delete this.pressedKeys[e.keyCode];

    e.preventDefault();
  }

  onDoubleClick(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onDoubleClick`);

    let consumed = false;
    for (const hovered of this.hoveredElements) {
      if (hovered._listeners && hovered._listeners.dblclick) {
        hovered.object.dispatchEvent({
          type: 'dblclick',
          mouse: this.mouse,
          object: hovered.object,
        });
        consumed = true;
        break;
      }
    }

    if (!consumed) {
      for (const inputListener of this.getSortedListeners()) {
        inputListener.dispatchEvent({
          type: 'dblclick',
          mouse: this.mouse,
          object: null,
        });
      }
    }

    e.preventDefault();
  }

  onMouseClick(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onMouseClick`);

    e.preventDefault();
  }

  onMouseDown(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onMouseDown`);

    e.preventDefault();

    let consumed = false;
    const consume = () => consumed = true;
    if (this.hoveredElements.length === 0) {
      for (const inputListener of this.getSortedListeners()) {
        inputListener.dispatchEvent({
          type: 'mousedown',
          viewer: this.viewer,
          mouse: this.mouse,
        });
      }
    } else {
      for (const hovered of this.hoveredElements) {
        const object = hovered.object;
        object.dispatchEvent({
          type: 'mousedown',
          viewer: this.viewer,
          consume,
        });

        if (consumed) {
          break;
        }
      }
    }

    if (!this.drag) {
      const target = this.hoveredElements
        .find(el => (
          el.object._listeners &&
            el.object._listeners.drag &&
            el.object._listeners.drag.length > 0));

      if (target) {
        this.startDragging(target.object, { location: target.point });
      } else {
        this.startDragging(null);
      }
    }

    if (this.scene) {
      this.viewStart = this.scene.view.clone();
    }
  }

  onMouseUp(e) {
    if (this.logMessages) console.log(`${this.constructor.name}: onMouseUp`);

    e.preventDefault();

    const noMovement = this.getNormalizedDrag().length() === 0;


    let consumed = false;
    const consume = () => consumed = true;
    if (this.hoveredElements.length === 0) {
      for (const inputListener of this.getSortedListeners()) {
        inputListener.dispatchEvent({
          type: 'mouseup',
          viewer: this.viewer,
          mouse: this.mouse,
          consume,
        });

        if (consumed) {
          break;
        }
      }
    } else {
      const hovered = this.hoveredElements
        .map(e => e.object)
        .find(e => (e._listeners && e._listeners.mouseup));
      if (hovered) {
        hovered.dispatchEvent({
          type: 'mouseup',
          viewer: this.viewer,
          consume,
        });
      }
    }

    if (this.drag) {
      if (this.drag.object) {
        if (this.logMessages) console.log(`${this.constructor.name}: drop ${this.drag.object.name}`);
        this.drag.object.dispatchEvent({
          type: 'drop',
          drag: this.drag,
          viewer: this.viewer,

        });
      } else {
        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: 'drop',
            drag: this.drag,
            viewer: this.viewer,
          });
        }
      }

      // check for a click
      const clicked = this.hoveredElements.map(h => h.object).find(v => v === this.drag.object) !== undefined;
      if (clicked) {
        if (this.logMessages) console.log(`${this.constructor.name}: click ${this.drag.object.name}`);
        this.drag.object.dispatchEvent({
          type: 'click',
          viewer: this.viewer,
          consume,
        });
      }

      this.drag = null;
    }

    if (!consumed) {
      if (e.button === THREE.MOUSE.LEFT) {
        if (noMovement) {
          let selectable = this.hoveredElements
            .find(el => el.object._listeners && el.object._listeners.select);

          if (selectable) {
            selectable = selectable.object;

            if (this.isSelected(selectable)) {
              this.selection
                .filter(e => e !== selectable)
                .forEach(e => this.toggleSelection(e));
            } else {
              this.deselectAll();
              this.toggleSelection(selectable);
            }
          } else {
            this.deselectAll();
          }
        }
      } else if ((e.button === THREE.MOUSE.RIGHT) && noMovement) {
        this.deselectAll();
      }
    }
  }

  onMouseMove(e) {
    e.preventDefault();

    const rect = this.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mouse.set(x, y);

    const hoveredElements = this.getHoveredElements();
    if (hoveredElements.length > 0) {
      const names = hoveredElements.map(h => h.object.name).join(', ');
      if (this.logMessages) console.log(`${this.constructor.name}: onMouseMove; hovered: '${names}'`);
    }

    if (this.drag) {
      this.drag.mouse = e.buttons;

      this.drag.lastDrag.x = x - this.drag.end.x;
      this.drag.lastDrag.y = y - this.drag.end.y;

      this.drag.end.set(x, y);

      if (this.drag.object) {
        if (this.logMessages) console.log(`${this.constructor.name}: drag: ${this.drag.object.name}`);
        this.drag.object.dispatchEvent({
          type: 'drag',
          drag: this.drag,
          viewer: this.viewer,
        });
      } else {
        if (this.logMessages) console.log(`${this.constructor.name}: drag: `);

        let dragConsumed = false;
        for (const inputListener of this.getSortedListeners()) {
          inputListener.dispatchEvent({
            type: 'drag',
            drag: this.drag,
            viewer: this.viewer,
            consume: () => { dragConsumed = true; },
          });

          if (dragConsumed) {
            break;
          }
        }
      }
    } else {
      const curr = hoveredElements.map(a => a.object).find(a => true);
      const prev = this.hoveredElements.map(a => a.object).find(a => true);

      if (curr !== prev) {
        if (curr) {
          if (this.logMessages) console.log(`${this.constructor.name}: mouseover: ${curr.name}`);
          curr.dispatchEvent({
            type: 'mouseover',
            object: curr,
          });
        }
        if (prev) {
          if (this.logMessages) console.log(`${this.constructor.name}: mouseleave: ${prev.name}`);
          prev.dispatchEvent({
            type: 'mouseleave',
            object: prev,
          });
        }
      }

      if (hoveredElements.length > 0) {
        const object = hoveredElements
          .map(e => e.object)
          .find(e => (e._listeners && e._listeners.mousemove));

        if (object) {
          object.dispatchEvent({
            type: 'mousemove',
            object,
          });
        }
      }
    }


    this.hoveredElements = hoveredElements;
  }

  onMouseWheel(e) {
    if (!this.enabled) return;

    if (this.logMessages) console.log(`${this.constructor.name}: onMouseWheel`);

    e.preventDefault();

    let delta = 0;
    if (e.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
      delta = e.wheelDelta;
    } else if (e.detail !== undefined) { // Firefox
      delta = -e.detail;
    }

    const ndelta = Math.sign(delta);

    // this.wheelDelta += Math.sign(delta);

    if (this.hoveredElement) {
      this.hoveredElement.object.dispatchEvent({
        type: 'mousewheel',
        delta: ndelta,
        object: this.hoveredElement.object,
      });
    } else {
      for (const inputListener of this.getSortedListeners()) {
        inputListener.dispatchEvent({
          type: 'mousewheel',
          delta: ndelta,
          object: null,
        });
      }
    }
  }

  startDragging(object, args = null) {
    const name = object ? object.name : 'no name';
    if (this.logMessages) console.log(`${this.constructor.name}: startDragging: '${name}'`);

    this.drag = {
      start: this.mouse.clone(),
      end: this.mouse.clone(),
      lastDrag: new THREE.Vector2(0, 0),
      startView: this.scene.view.clone(),
      object,
    };

    if (args) {
      for (const key of Object.keys(args)) {
        this.drag[key] = args[key];
      }
    }
  }

  getMousePointCloudIntersection(mouse) {
    return Utils.getMousePointCloudIntersection(
      this.mouse,
      this.scene.getActiveCamera(),
      this.viewer,
      this.scene.pointclouds);
  }

  toggleSelection(object) {
    const oldSelection = this.selection;

    const index = this.selection.indexOf(object);

    if (index === -1) {
      this.selection.push(object);
      object.dispatchEvent({
        type: 'select',
      });
    } else {
      this.selection.splice(index, 1);
      object.dispatchEvent({
        type: 'deselect',
      });
    }

    this.dispatchEvent({
      type: 'selection_changed',
      oldSelection,
      selection: this.selection,
    });
  }

  deselect(object) {
    const oldSelection = this.selection;

    const index = this.selection.indexOf(object);

    if (index >= 0) {
      this.selection.splice(index, 1);
      object.dispatchEvent({
        type: 'deselect',
      });

      this.dispatchEvent({
        type: 'selection_changed',
        oldSelection,
        selection: this.selection,
      });
    }
  }

  deselectAll() {
    for (const object of this.selection) {
      object.dispatchEvent({
        type: 'deselect',
      });
    }

    const oldSelection = this.selection;

    if (this.selection.length > 0) {
      this.selection = [];
      this.dispatchEvent({
        type: 'selection_changed',
        oldSelection,
        selection: this.selection,
      });
    }
  }

  isSelected(object) {
    const index = this.selection.indexOf(object);

    return index !== -1;
  }

  registerInteractiveObject(object) {
    this.interactiveObjects.add(object);
  }

  removeInteractiveObject(object) {
    this.interactiveObjects.delete(object);
  }

  registerInteractiveScene(scene) {
    const index = this.interactiveScenes.indexOf(scene);
    if (index === -1) {
      this.interactiveScenes.push(scene);
    }
  }

  unregisterInteractiveScene(scene) {
    const index = this.interactiveScenes.indexOf(scene);
    if (index > -1) {
      this.interactiveScenes.splice(index, 1);
    }
  }

  getHoveredElement() {
    const hoveredElements = this.getHoveredElements();
    if (hoveredElements.length > 0) {
      return hoveredElements[0];
    }
    return null;
  }

  getHoveredElements() {
    const scenes = this.interactiveScenes.concat(this.scene.scene);

    const interactableListeners = ['mouseup', 'mousemove', 'mouseover', 'mouseleave', 'drag', 'drop', 'click', 'select', 'deselect'];
    const interactables = [];
    for (const scene of scenes) {
      scene.traverseVisible((node) => {
        if (node._listeners && node.visible && !this.blacklist.has(node)) {
          const hasInteractableListener = interactableListeners.filter(e => node._listeners[e] !== undefined).length > 0;

          if (hasInteractableListener) {
            interactables.push(node);
          }
        }
      });
    }

    const camera = this.scene.getActiveCamera();
    const ray = Utils.mouseToRay(this.mouse, camera, this.domElement.clientWidth, this.domElement.clientHeight);

    const raycaster = new THREE.Raycaster();
    raycaster.ray.set(ray.origin, ray.direction);
    raycaster.linePrecision = 0.2;

    const intersections = raycaster.intersectObjects(interactables.filter(o => o.visible), false);

    return intersections;

    // if(intersections.length > 0){
    //	return intersections[0];
    // }else{
    //	return null;
    // }
  }

  setScene(scene) {
    this.deselectAll();

    this.scene = scene;
  }

  update(delta) {

  }

  getNormalizedDrag() {
    if (!this.drag) {
      return new THREE.Vector2(0, 0);
    }

    const diff = new THREE.Vector2().subVectors(this.drag.end, this.drag.start);

    diff.x /= this.domElement.clientWidth;
    diff.y /= this.domElement.clientHeight;

    return diff;
  }

  getNormalizedLastDrag() {
    if (!this.drag) {
      return new THREE.Vector2(0, 0);
    }

    const lastDrag = this.drag.lastDrag.clone();

    lastDrag.x /= this.domElement.clientWidth;
    lastDrag.y /= this.domElement.clientHeight;

    return lastDrag;
  }
}
