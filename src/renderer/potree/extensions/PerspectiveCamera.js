
THREE.PerspectiveCamera.prototype.zoomTo = function (node, factor) {
  if (!node.geometry && !node.boundingSphere && !node.boundingBox) {
    return;
  }

  if (node.geometry && node.geometry.boundingSphere === null) {
    node.geometry.computeBoundingSphere();
  }

  node.updateMatrixWorld();

  let bs;

  if (node.boundingSphere) {
    bs = node.boundingSphere;
  } else if (node.geometry && node.geometry.boundingSphere) {
    bs = node.geometry.boundingSphere;
  } else {
    bs = node.boundingBox.getBoundingSphere(new THREE.Sphere());
  }

  const _factor = factor || 1;

  bs = bs.clone().applyMatrix4(node.matrixWorld);
  const radius = bs.radius;
  let fovr = this.fov * Math.PI / 180;

  if (this.aspect < 1) {
    fovr *= this.aspect;
  }

  const distanceFactor = Math.abs(radius / Math.sin(fovr / 2)) * _factor;

  const offset = this.getWorldDirection(new THREE.Vector3()).multiplyScalar(-distanceFactor);
  this.position.copy(bs.center.clone().add(offset));
};
