function Scope() {
  this.$$watchers = [];
}


Scope.prototype.$watch = function (watchFn, listenerFn) {
  const watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
  };
  
  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  this.$$watchers.forEach(watcher => {
    watcher.listenerFn();
  });
};

module.exports = Scope;