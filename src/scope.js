const _ = require("lodash");

/**
 * Note 1:  If all digests are clean will short circuit the loop instead of continuing to check watcehrs that are clean. Returning false in lodash forEach short cicuits loop.
 * NOte 2: Prevents digest from prematurely ending (Note 1) in cases where new watches are added as part of the digest cycle.
 *
 */
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
  // Edge case. Note 2
  this.$$lastDirtyWatch = null;
};

Scope.prototype.$digestOnce = function() {
  let isWatchDirty; //dirty

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

      isWatchDirty = true;
      // Optimization:  Note 1
    } else if (watcher === this.$$lastDirtyWatch) {
      return false;
    }
  });

  return isWatchDirty;
};

Scope.prototype.$digest = function() {
  let timeToLive = 10; // ttl
  let isWatchDirty; // dirty
  this.$$lastDirtyWatch = null;

  do {
    isWatchDirty = this.$digestOnce();

    if (isWatchDirty && !timeToLive--) {
      throw "10 digest iterations reached";
    }
  } while (isWatchDirty);
};

module.exports = Scope;
