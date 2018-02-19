const Scope = require('../src/scope');

describe('Scope', () => {
  it('can be constructed and used as an object', () => {
    const scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe('digest', () => {
    let scope;
  
    beforeEach(() => {
      scope = new Scope();
    });
  
    it('calls the listener function of a watch on first $digest', () => {
      const watchFn = () => 'wat';
      const listenerFn = jasmine.createSpy();
  
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      
      expect(listenerFn).toHaveBeenCalled();
    });
  
    it('calls the watch function with the scope as the argument', () => {
      const watchFn = jasmine.createSpy();
      const listenerFn = function() {};
  
      scope.$watch(watchFn, listenerFn);
      scope.$digest();

      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it('calls the listener function when the watched value changes', () => {
      scope.someValue = 'original value';
      scope.counter = 0;

      const watchFn = (scope) => scope.someValue;
      const listenerFn = (newValue, oldValue, scope) => { scope.counter++ }

      scope.$watch(watchFn, listenerFn);

      expect(scope.counter).toBe(0);

      scope.$digest();
      // listenerFn always called during the first $digest loop after it was registered
      expect(scope.counter).toBe(1);

      scope.$digest();
      //After first loop, only called when watchFn value changes
      expect(scope.counter).toBe(1)

      scope.someValue = 'new value';
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(2);
    })

    it('calls listener when watch value is first undefined', () => {
      scope.counter = 0;
      const watchFn = (scope) => scope.someValue;
      const listenerFn = (newValue, oldValue, scope) => { scope.counter++ };

      scope.$watch(watchFn, listenerFn);

      scope.$digest();
      expect(scope.counter).toBe(1);
    })
  });
});

