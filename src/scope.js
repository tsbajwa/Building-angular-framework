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
    watcher.watchFn(this);
    watcher.listenerFn();
  });
};

module.exports = Scope;