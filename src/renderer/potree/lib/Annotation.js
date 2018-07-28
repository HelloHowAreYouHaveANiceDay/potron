import * as THREE from 'three';
import $ from 'jquery';

import TWEEN from '../tween';

import EventDispatcher from './EventDispatcher';
import Action from './Action';
import Utils from './Utils';

class Annotation extends EventDispatcher {
  constructor(args = {}) {
    super();

    // const valueOrDefault = (a, b) => {
    //   if (a === null || a === undefined) {
    //     return b;
    //   }
    //   return a;

    // };

    this.scene = null;
    this._title = args.title || 'No Title';
    this._description = args.description || '';
    this.offset = new THREE.Vector3();

    if (!args.position) {
      this.position = null;
    } else if (args.position instanceof THREE.Vector3) {
      this.position = args.position;
    } else {
      this.position = new THREE.Vector3(...args.position);
    }

    this.cameraPosition = (args.cameraPosition instanceof Array)
      ? new THREE.Vector3().fromArray(args.cameraPosition) : args.cameraPosition;
    this.cameraTarget = (args.cameraTarget instanceof Array)
      ? new THREE.Vector3().fromArray(args.cameraTarget) : args.cameraTarget;
    this.radius = args.radius;
    this.view = args.view || null;
    this.keepOpen = false;
    this.descriptionVisible = false;
    this.showDescription = true;
    this.actions = args.actions || [];
    this.isHighlighted = false;
    this._visible = true;
    this.__visible = true;
    this._display = true;
    this._expand = false;
    this.collapseThreshold = [args.collapseThreshold, 100].find(e => e !== undefined);

    this.children = [];
    this.parent = null;
    this.boundingBox = new THREE.Box3();

    const iconClose = 'static/icons/close.svg';

    this.domElement = $(`
    <div class="annotation" oncontextmenu="return false;">
      <div class="annotation-titlebar">
        <span class="annotation-label"></span>
      </div>
      <div class="annotation-description">
        <span class="annotation-description-close">
          <img src="${iconClose}" width="16px">
        </span>
        <span class="annotation-description-content">${this._description}</span>
      </div>
    </div>
  `);

    this.elTitlebar = this.domElement.find('.annotation-titlebar');
    this.elTitle = this.elTitlebar.find('.annotation-label');
    this.elTitle.append(this._title);
    this.elDescription = this.domElement.find('.annotation-description');
    this.elDescriptionClose = this.elDescription.find('.annotation-description-close');
    // this.elDescriptionContent = this.elDescription.find(".annotation-description-content");

    this.clickTitle = () => {
      if (this.hasView()) {
        this.moveHere(this.scene.getActiveCamera());
      }
      this.dispatchEvent({ type: 'click', target: this });
    };

    this.elTitle.click(this.clickTitle);

    this.actions = this.actions.map((a) => {
      if (a instanceof Action) {
        return a;
      }
      return new Action(a);
    });

    for (const action of this.actions) {
      action.pairWith(this);
    }

    const actions = this.actions.filter(
      a => a.showIn === undefined || a.showIn.includes('scene'));

    for (const action of actions) {
      const elButton = $(`<img src="${action.icon}" class="annotation-action-icon">`);
      this.elTitlebar.append(elButton);
      elButton.click(() => action.onclick({ annotation: this }));
    }

    this.elDescriptionClose.hover(
      () => this.elDescriptionClose.css('opacity', '1'),
      () => this.elDescriptionClose.css('opacity', '0.5'),
    );
    this.elDescriptionClose.click(() => this.setHighlighted(false));
    // this.elDescriptionContent.html(this._description);

    this.domElement.mouseenter(() => this.setHighlighted(true));
    this.domElement.mouseleave(() => this.setHighlighted(false));

    this.domElement.on('touchstart', () => {
      this.setHighlighted(!this.isHighlighted);
    });

    this.display = false;
    // this.display = true;
  }

  installHandles(viewer) {
    if (this.handles !== undefined) {
      return;
    }

    const domElement = $(`
    <div style="position: absolute; left: 300; top: 200; pointer-events: none">
      <svg width="300" height="600">
        <line x1="0" y1="0" x2="1200" y2="200" style="stroke: black; stroke-width:2" />
        <circle cx="50" cy="50" r="4" stroke="black" stroke-width="2" fill="gray" />
        <circle cx="150" cy="50" r="4" stroke="black" stroke-width="2" fill="gray" />
      </svg>
    </div>
  `);

    const svg = domElement.find('svg')[0];
    const elLine = domElement.find('line')[0];
    const elStart = domElement.find('circle')[0];
    const elEnd = domElement.find('circle')[1];

    const setCoordinates = (start, end) => {
      elStart.setAttribute('cx', `${start.x}`);
      elStart.setAttribute('cy', `${start.y}`);

      elEnd.setAttribute('cx', `${end.x}`);
      elEnd.setAttribute('cy', `${end.y}`);

      elLine.setAttribute('x1', start.x);
      elLine.setAttribute('y1', start.y);
      elLine.setAttribute('x2', end.x);
      elLine.setAttribute('y2', end.y);

      const box = svg.getBBox();
      svg.setAttribute('width', `${box.width}`);
      svg.setAttribute('height', `${box.height}`);
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);

      const ya = start.y - end.y;
      const xa = start.x - end.x;

      if (ya > 0) {
        start.y -= ya;
      }
      if (xa > 0) {
        start.x -= xa;
      }

      domElement.css('left', `${start.x}px`);
      domElement.css('top', `${start.y}px`);
    };

    $(viewer.renderArea).append(domElement);


    let annotationStartPos = this.position.clone();
    let annotationStartOffset = this.offset.clone();

    $(this.domElement).draggable({
      start: () => {
        annotationStartPos = this.position.clone();
        annotationStartOffset = this.offset.clone();
        $(this.domElement).find('.annotation-titlebar').css('pointer-events', 'none');

        console.log($(this.domElement).find('.annotation-titlebar')); // eslint-disable-line
      },
      stop: () => {
        $(this.domElement).find('.annotation-titlebar').css('pointer-events', '');
      },
      drag: (event, ui) => {
        const renderAreaWidth = viewer.renderer.getSize().width;
        // const renderAreaHeight = viewer.renderer.getSize().height;

        const diff = {
          x: ui.originalPosition.left - ui.position.left,
          y: ui.originalPosition.top - ui.position.top,
        };

        const nDiff = {
          x: -(diff.x / renderAreaWidth) * 2,
          y: (diff.y / renderAreaWidth) * 2,
        };

        const camera = viewer.scene.getActiveCamera();
        const oldScreenPos = new THREE.Vector3()
          .addVectors(annotationStartPos, annotationStartOffset)
          .project(camera);

        const newScreenPos = oldScreenPos.clone();
        newScreenPos.x += nDiff.x;
        newScreenPos.y += nDiff.y;

        const newPos = newScreenPos.clone();
        newPos.unproject(camera);

        const newOffset = new THREE.Vector3().subVectors(newPos, this.position);
        this.offset.copy(newOffset);
      },
    });

    const updateCallback = () => {
      // const position = this.position;
      const scene = viewer.scene;

      const renderAreaWidth = viewer.renderer.getSize().width;
      const renderAreaHeight = viewer.renderer.getSize().height;

      let start = this.position.clone();
      let end = new THREE.Vector3().addVectors(this.position, this.offset);

      const toScreen = (position) => {
        const camera = scene.getActiveCamera();
        const screenPos = new THREE.Vector3();

        const worldView = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const ndc = new THREE.Vector4(position.x, position.y, position.z, 1.0).applyMatrix4(worldView);
        // limit w to small positive value, in case position is behind the camera
        ndc.w = Math.max(ndc.w, 0.1);
        ndc.divideScalar(ndc.w);

        screenPos.copy(ndc);
        screenPos.x = renderAreaWidth * (screenPos.x + 1) / 2;
        screenPos.y = renderAreaHeight * (1 - (screenPos.y + 1) / 2);

        return screenPos;
      };

      start = toScreen(start);
      end = toScreen(end);

      setCoordinates(start, end);
    };

    viewer.addEventListener('update', updateCallback);

    this.handles = {
      domElement,
      setCoordinates,
      updateCallback,
    };
  }

  removeHandles(viewer) {
    if (this.handles === undefined) {
      return;
    }

    // $(viewer.renderArea).remove(this.handles.domElement);
    this.handles.domElement.remove();
    viewer.removeEventListener('update', this.handles.updateCallback);

    delete this.handles;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (this._visible === value) {
      return;
    }

    this._visible = value;

    // this.traverse(node => {
    //	node.display = value;
    // });

    this.dispatchEvent({
      type: 'visibility_changed',
      annotation: this,
    });
  }

  get display() {
    return this._display;
  }

  set display(display) {
    if (this._display === display) {
      return;
    }

    this._display = display;

    if (display) {
      // this.domElement.fadeIn(200);
      this.domElement.show();
    } else {
      // this.domElement.fadeOut(200);
      this.domElement.hide();
    }
  }

  get expand() {
    return this._expand;
  }

  set expand(expand) {
    if (this._expand === expand) {
      return;
    }

    if (expand) {
      this.display = false;
    } else {
      this.display = true;
      this.traverseDescendants((node) => {
        node.display = false;
      });
    }

    this._expand = expand;
  }

  get title() {
    return this._title;
  }

  set title(title) {
    if (this._title === title) {
      return;
    }

    this._title = title;
    this.elTitle.empty();
    this.elTitle.append(this._title);
  }

  get description() {
    return this._description;
  }

  set description(description) {
    if (this._description === description) {
      return;
    }

    this._description = description;

    const elDescriptionContent = this.elDescription.find('.annotation-description-content');
    elDescriptionContent.empty();
    elDescriptionContent.append(this._description);
  }

  add(annotation) {
    if (!this.children.includes(annotation)) {
      this.children.push(annotation);
      annotation.parent = this;

      const descendants = [];
      annotation.traverse((a) => { descendants.push(a); });

      for (const descendant of descendants) {
        let c = this;
        while (c !== null) {
          c.dispatchEvent({
            type: 'annotation_added',
            annotation: descendant,
          });
          c = c.parent;
        }
      }
    }
  }

  level() {
    if (this.parent === null) {
      return 0;
    }
    return this.parent.level() + 1;
  }

  hasChild(annotation) {
    return this.children.includes(annotation);
  }

  remove(annotation) {
    if (this.hasChild(annotation)) {
      annotation.removeAllChildren();
      annotation.dispose();
      this.children = this.children.filter(e => e !== annotation);
      annotation.parent = null;
    }
  }

  removeAllChildren() {
    this.children.forEach((child) => {
      if (child.children.length > 0) {
        child.removeAllChildren();
      }

      this.remove(child);
    });
  }

  updateBounds() {
    const box = new THREE.Box3();

    if (this.position) {
      box.expandByPoint(this.position);
    }

    for (const child of this.children) {
      child.updateBounds();

      box.union(child.boundingBox);
    }

    this.boundingBox.copy(box);
  }

  traverse(handler) {
    const expand = handler(this);

    if (expand === undefined || expand === true) {
      for (const child of this.children) {
        child.traverse(handler);
      }
    }
  }

  traverseDescendants(handler) {
    for (const child of this.children) {
      child.traverse(handler);
    }
  }

  flatten() {
    const annotations = [];

    this.traverse((annotation) => {
      annotations.push(annotation);
    });

    return annotations;
  }

  descendants() {
    const annotations = [];

    this.traverse((annotation) => {
      if (annotation !== this) {
        annotations.push(annotation);
      }
    });

    return annotations;
  }

  setHighlighted(highlighted) {
    if (highlighted) {
      this.domElement.css('opacity', '0.8');
      this.elTitlebar.css('box-shadow', '0 0 5px #fff');
      this.domElement.css('z-index', '1000');

      if (this._description) {
        this.descriptionVisible = true;
        this.elDescription.fadeIn(200);
        this.elDescription.css('position', 'relative');
      }
    } else {
      this.domElement.css('opacity', '0.5');
      this.elTitlebar.css('box-shadow', '');
      this.domElement.css('z-index', '100');
      this.descriptionVisible = false;
      this.elDescription.css('display', 'none');
    }

    this.isHighlighted = highlighted;
  }

  hasView() {
    let hasPosTargetView = this.cameraTarget instanceof THREE.Vector3;
    hasPosTargetView = hasPosTargetView && this.cameraPosition instanceof THREE.Vector3;

    const hasRadiusView = this.radius !== undefined;

    const hasView = hasPosTargetView || hasRadiusView;

    return hasView;
  }

  moveHere() {
    if (!this.hasView()) {
      return;
    }

    const view = this.scene.view;
    const animationDuration = 500;
    const easing = TWEEN.Easing.Quartic.Out;

    let endTarget;
    if (this.cameraTarget) {
      endTarget = this.cameraTarget;
    } else if (this.position) {
      endTarget = this.position;
    } else {
      endTarget = this.boundingBox.getCenter(new THREE.Vector3());
    }

    if (this.cameraPosition) {
      const endPosition = this.cameraPosition;

      Utils.moveTo(this.scene, endPosition, endTarget);

      // { // animate camera position
      //	let tween = new TWEEN.Tween(view.position).to(endPosition, animationDuration);
      //	tween.easing(easing);
      //	tween.start();
      // }

      // { // animate camera target
      //	let camTargetDistance = camera.position.distanceTo(endTarget);
      //	let target = new THREE.Vector3().addVectors(
      //		camera.position,
      //		camera.getWorldDirection().clone().multiplyScalar(camTargetDistance)
      //	);
      //	let tween = new TWEEN.Tween(target).to(endTarget, animationDuration);
      //	tween.easing(easing);
      //	tween.onUpdate(() => {
      //		view.lookAt(target);
      //	});
      //	tween.onComplete(() => {
      //		view.lookAt(target);
      //		this.dispatchEvent({type: 'focusing_finished', target: this});
      //	});

      //	this.dispatchEvent({type: 'focusing_started', target: this});
      //	tween.start();
      // }
    } else if (this.radius) {
      const direction = view.direction;
      const endPosition = endTarget.clone().add(direction.multiplyScalar(-this.radius));
      const startRadius = view.radius;
      const endRadius = this.radius;

      { // animate camera position
        const tween = new TWEEN.Tween(view.position).to(endPosition, animationDuration);
        tween.easing(easing);
        tween.start();
      }

      { // animate radius
        const t = { x: 0 };

        const tween = new TWEEN.Tween(t)
          .to({ x: 1 }, animationDuration)
          .onUpdate(function () {
            view.radius = this.x * endRadius + (1 - this.x) * startRadius;
          });
        tween.easing(easing);
        tween.start();
      }
    }
  }

  dispose() {
    if (this.domElement.parentElement) {
      this.domElement.parentElement.removeChild(this.domElement);
    }
  }

  toString() {
    return `Annotation: ${this._title}`;
  }
}

export default Annotation;
