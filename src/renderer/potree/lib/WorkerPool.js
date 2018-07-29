class WorkerPool {
  constructor() {
    this.workers = {};
  }

  getWorker(url) {
    if (!this.workers[url]) {
      this.workers[url] = [];
    }

    if (this.workers[url].length === 0) {
      const worker = new Worker(url);
      this.workers[url].push(worker);
    }

    const worker = this.workers[url].pop();

    return worker;
  }

  returnWorker(url, worker) {
    this.workers[url].push(worker);
  }
}

export default WorkerPool;
