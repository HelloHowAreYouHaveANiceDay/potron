export default class ProfileWindowController {
  constructor(viewer) {
    this.viewer = viewer;
    this.profileWindow = viewer.profileWindow;
    this.profile = null;
    this.numPoints = 0;
    this.threshold = 60 * 1000;
    this.scheduledRecomputeTime = null;

    this.enabled = true;

    this.requests = [];

    this._recompute = () => { this.recompute(); };

    this.viewer.addEventListener('scene_changed', (e) => {
      e.oldScene.removeEventListener('pointcloud_added', this._recompute);
      e.scene.addEventListener('pointcloud_added', this._recompute);
    });
    this.viewer.scene.addEventListener('pointcloud_added', this._recompute);
  }

  setProfile(profile) {
    if (this.profile !== null && this.profile !== profile) {
      this.profile.removeEventListener('marker_moved', this._recompute);
      this.profile.removeEventListener('marker_added', this._recompute);
      this.profile.removeEventListener('marker_removed', this._recompute);
      this.profile.removeEventListener('width_changed', this._recompute);
    }

    this.profile = profile;

    {
      this.profile.addEventListener('marker_moved', this._recompute);
      this.profile.addEventListener('marker_added', this._recompute);
      this.profile.addEventListener('marker_removed', this._recompute);
      this.profile.addEventListener('width_changed', this._recompute);
    }

    this.recompute();
  }

  reset() {
    this.profileWindow.reset();

    this.numPoints = 0;

    if (this.profile) {
      for (const request of this.requests) {
        request.cancel();
      }
    }
  }

  progressHandler(pointcloud, progress) {
    for (const segment of progress.segments) {
      this.profileWindow.addPoints(pointcloud, segment.points);
      this.numPoints += segment.points.numPoints;
    }
  }

  cancel() {
    for (const request of this.requests) {
      request.cancel();
      // request.finishLevelThenCancel();
    }

    this.requests = [];
  }

  finishLevelThenCancel() {
    for (const request of this.requests) {
      request.finishLevelThenCancel();
    }

    this.requests = [];
  }

  recompute() {
    if (!this.profile) {
      return;
    }

    if (this.scheduledRecomputeTime !== null && this.scheduledRecomputeTime > new Date().getTime()) {
      return;
    }
    this.scheduledRecomputeTime = new Date().getTime() + 100;

    this.scheduledRecomputeTime = null;

    this.reset();

    for (const pointcloud of this.viewer.scene.pointclouds.filter(p => p.visible)) {
      const request = pointcloud.getPointsInProfile(this.profile, null, {
        onProgress: (event) => {
          if (!this.enabled) {
            return;
          }

          this.progressHandler(pointcloud, event.points);

          if (this.numPoints > this.threshold) {
            this.finishLevelThenCancel();
          }
        },
        onFinish: () => {
          if (!this.enabled) {

          }
        },
        onCancel: () => {
          if (!this.enabled) {

          }
        },
      });

      this.requests.push(request);
    }
  }
}
