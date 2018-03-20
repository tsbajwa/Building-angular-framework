//Function is referenced so watcher.last will iniitally always be unique
function initWatchVal() {}

function Scope() {
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn = () => {}) {
  const watcher = {
    watchFn,
    listenerFn,
    last: initWatchVal
  };

  this.$$watchers = [...this.$$watchers, watcher];
};

Scope.prototype.$digestOnce = function() {
  let dirty;

  this.$$watchers.forEach(watcher => {
    const newValue = watcher.watchFn(this);
    let oldValue = watcher.last;

    if (newValue !== oldValue) {
      watcher.last = newValue;

      watcher.listenerFn(
        newValue,
        oldValue === initWatchVal ? newValue : oldValue,
        this
      );

      dirty = true;
    }
  });

  return dirty;
};

Scope.prototype.$digest = function() {
  let timeToLive = (ttl = 10);
  let dirty;

  do {
    dirty = this.$digestOnce();

    if (dirty && !ttl--) {
      throw "10 digest iterations reached";
    }
  } while (dirty);
};

module.exports = Scope;
