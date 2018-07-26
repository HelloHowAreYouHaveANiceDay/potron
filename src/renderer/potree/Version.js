export default class Version {
  constructor(version) {
    this.version = version;
    const vmLength = (version.indexOf('.') === -1) ? version.length : version.indexOf('.');
    this.versionMajor = parseInt(version.substr(0, vmLength), 10);
    this.versionMinor = parseInt(version.substr(vmLength + 1), 10);
    if (this.versionMinor.length === 0) {
      this.versionMinor = 0;
    }
  }

  newerThan(version) {
    const v = new Version(version);

    if (this.versionMajor > v.versionMajor) {
      return true;
    } else if (this.versionMajor === v.versionMajor && this.versionMinor > v.versionMinor) {
      return true;
    }
    return false;
  }

  equalOrHigher(version) {
    const v = new Version(version);

    if (this.versionMajor > v.versionMajor) {
      return true;
    } else if (this.versionMajor === v.versionMajor && this.versionMinor >= v.versionMinor) {
      return true;
    }
    return false;
  }

  upTo(version) {
    return !this.newerThan(version);
  }
}

