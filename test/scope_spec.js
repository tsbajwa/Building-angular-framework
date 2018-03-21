const _ = require("lodash");
const Scope = require("../src/scope");

describe("Scope", () => {
  it("can be constructed and used as an object", () => {
    const scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe("digest", () => {
    let scope;

    beforeEach(() => {
      scope = new Scope();
    });

    it("calls the listener function of a watch on first $digest", () => {
      const watchFn = () => "wat";
      const listenerFn = jasmine.createSpy();

      scope.$watch(watchFn, listenerFn);
      scope.$digest();

      expect(listenerFn).toHaveBeenCalled();
    });

    it("calls the watch function with the scope as the argument", () => {
      const watchFn = jasmine.createSpy();
      const listenerFn = function() {};

      scope.$watch(watchFn, listenerFn);
      scope.$digest();

      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it("calls the listener function when the watched value changes", () => {
      scope.someValue = "original value";
      scope.counter = 0;

      const watchFn = scope => scope.someValue;
      const listenerFn = (newValue, oldValue, scope) => {
        scope.counter++;
      };

      scope.$watch(watchFn, listenerFn);

      expect(scope.counter).toBe(0);

      scope.$digest();
      // listenerFn always called during the first $digest loop after it was registered
      expect(scope.counter).toBe(1);

      scope.$digest();
      //After first loop, only called when watchFn value changes
      expect(scope.counter).toBe(1);

      scope.someValue = "new value";
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("calls listener when watch value is first undefined", () => {
      scope.counter = 0;
      const watchFn = scope => scope.someValue;
      const listenerFn = (newValue, oldValue, scope) => {
        scope.counter++;
      };

      scope.$watch(watchFn, listenerFn);

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("may have watchers tha omit the listener function", () => {
      const watchFn = jasmine.createSpy().and.returnValue("something");
      scope.$watch(watchFn);
      scope.$digest();

      expect(watchFn).toHaveBeenCalled();
    });

    it("triggers chained watchers in the same digest", () => {
      scope.name = "Jane";

      const watchFn = scope => scope.nameUpper;
      const listenerFn = (newValue, oldValue, scope) => {
        if (newValue) {
          scope.initial = newValue.substring(0, 1) + ".";
        }
      };

      scope.$watch(watchFn, listenerFn);

      const nextWatchFn = scope => scope.name;
      const nextListenerFn = (newValue, oldValue, scope) => {
        if (newValue) {
          scope.nameUpper = newValue.toUpperCase();
        }
      };

      scope.$watch(nextWatchFn, nextListenerFn);

      scope.$digest();
      expect(scope.initial).toBe("J.");

      scope.name = "Bob";
      scope.$digest();
      expect(scope.initial).toBe("B.");
    });

    it("gives up on the watchers after 10 iterations", () => {
      scope.counterA = 0;
      scope.counterB = 0;

      const watchFn = () => scope.counterA;
      const listenerFn = (newValue, oldValue, scope) => {
        scope.counterB++;
      };

      scope.$watch(watchFn, listenerFn);

      const nextWatchFn = () => scope.counterB;
      const nextListenerFn = (newValue, oldValue, scope) => {
        scope.counterA++;
      };

      scope.$watch(nextWatchFn, nextListenerFn);

      expect(() => {
        scope.$digest();
      }).toThrow();
    });

    fit("end the digest when the last watch is clean", () => {
      scope.array = _.range(100);
      let watchExecutions = 0;

      _.times(100, i => {
        let watchFn = scope => {
          watchExecutions++;
          return scope.array[i];
        };

        let listenerFn = (newValue, oldValue, scope) => {};

        scope.$watch(watchFn, listenerFn);
      });

      scope.$digest();
      expect(watchExecutions).toBe(200);

      scope.array[0] = 420;
      scope.$digest();
      expect(watchExecutions).toBe(301);
    });
  });
});
