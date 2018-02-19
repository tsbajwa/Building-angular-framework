function Scope() {
  this.$$watchers = [];
}


Scope.prototype.$watch = function (watchFn, listenerFn) {
  const watcher = {
    watchFn,
    listenerFn,
  };
  
  this.$$watchers = [...this.$$watchers, watcher];
};

Scope.prototype.$digest = function() {
  this.$$watchers.forEach(watcher => {
    const newValue = watcher.watchFn(this);
    const oldValue = watcher.last;

    if (newValue !== oldValue) {
      watcher.last = newValue;
      watcher.listenerFn(newValue, oldValue, this);
    }
  });
};

module.exports = Scope;