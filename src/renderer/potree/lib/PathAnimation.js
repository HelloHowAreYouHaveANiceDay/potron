import TWEEN from '../tween.js';

export default class PathAnimation {
  constructor(path, start, end, speed, callback) {
    this.path = path;
    this.length = this.path.spline.getLength();
    this.speed = speed;
    this.callback = callback;
    this.tween = null;
    this.startPoint = Math.max(start, 0);
    this.endPoint = Math.min(end, this.length);
    this.t = 0.0;
  }

  start(resume = false) {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }

    let tStart;
    if (resume) {
      tStart = this.t;
    } else {
      tStart = this.startPoint / this.length;
    }
    const tEnd = this.endPoint / this.length;
    const animationDuration = (tEnd - tStart) * this.length * 1000 / this.speed;

    const progress = { t: tStart };
    this.tween = new TWEEN.Tween(progress).to({ t: tEnd }, animationDuration);
    this.tween.easing(TWEEN.Easing.Linear.None);
    this.tween.onUpdate((e) => { // eslint-disable-line
      this.t = progress.t;
      this.callback(progress.t);
    });
    this.tween.onComplete(() => {
      if (this.repeat) {
        this.start();
      }
    });

    setTimeout(() => {
      this.tween.start();
    }, 0);
  }

  stop() {
    if (!this.tween) {
      return;
    }
    this.tween.stop();
    this.tween = null;
    this.t = 0;
  }

  pause() {
    if (!this.tween) {
      return;
    }

    this.tween.stop();
    TWEEN.remove(this.tween);
    this.tween = null;
  }

  resume() {
    this.start(true);
  }

  getPoint(t) {
    return this.path.spline.getPoint(t);
  }
}
