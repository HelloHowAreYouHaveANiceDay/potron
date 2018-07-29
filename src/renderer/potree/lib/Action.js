import EventDispatcher from './EventDispatcher';

export default class Action extends EventDispatcher {
  constructor(args = {}) {
    super();

    this.icon = args.icon || '';
    this.tooltip = args.tooltip;

    if (args.onclick !== undefined) {
      this.onclick = args.onclick;
    }
  }

  // onclick(event) {

  // }

  // pairWith(object) {

  // }

  setIcon(newIcon) {
    const oldIcon = this.icon;

    if (newIcon === oldIcon) {
      return;
    }

    this.icon = newIcon;

    this.dispatchEvent({
      type: 'icon_changed',
      action: this,
      icon: newIcon,
      oldIcon,
    });
  }
}
