const _ = require("lodash");

//Function is referenced so watcher.last will iniitally always be unique
function initWatchVal() {}

function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
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

  _.forEach(this.$$watchers, watcher => {
    const newValue = watcher.watchFn(this);
    let oldValue = watcher.last;

    if (newValue !== oldValue) {
      this.$$lastDirtyWatch = watcher;
      watcher.last = newValue;

      watcher.listenerFn(
        newValue,
        oldValue === initWatchVal ? newValue : oldValue,
        this
      );

      dirty = true;
      //Optimization: Short ciruits the digest (Note 1)
    } else if (watcher === this.$$lastDirtyWatch) {
      return false;
    }
  });

  return dirty;
};

Scope.prototype.$digest = function() {
  let timeToLive = (ttl = 10);
  let dirty;
  this.$$lastDirtyWatch = null;

  do {
    dirty = this.$digestOnce();

    if (dirty && !ttl--) {
      throw "10 digest iterations reached";
    }
  } while (dirty);
};

module.exports = Scope;