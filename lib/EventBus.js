var EventEmitter = require('events').EventEmitter;


class EventBus extends EventEmitter {

  constructor() {
    super();
    this.setMaxListeners(10000);
    this.models = {}
  }

  registerIOC(name, model) {
    if( this.models[name] ) {
      throw new Error(`A model has already been registered with name: ${name}`);
    }

    this.models[name] = model;
  }

  inject(name) {
    if( !this.models[name] ) {
      throw new Error(`No model has been registered with name: ${name}`);
    }

    return this.models[name];
  }

  /**
   * This is what models bind with
   * 
   * @param {*} globalName 
   * @param {*} methodFunction 
   */
  handleMethod(globalName, methodFunction) {
    if( this._events[globalName] ) {
      throw new Error(`Global method already registered: ${globalName}`);
    }

    // Note: you can't use arrow function to get arguments object
    super.on(globalName, function() {

      // pop off the promise wrapper arguments
      var resolve = arguments[0];
      var reject = arguments[1];

      // fill up our actual argument array
      var args = [];
      for( var i = 2; i < arguments.length; i++ ) {
        args.push(arguments[i]);
      }

      try {
        // attempt to call handler with arguments
        var resp = methodFunction.apply(this, args);

        // method returned a promise, just wait for it to resolve
        if( resp && typeof resp === 'object' && typeof resp.then === 'function' ) {
          resp
            .then((result) => resolve(result))
            .catch((error) => reject(error));

        // method returned something other than a promise, resolve now
        } else {
          resolve(resp);
        }
      
      // badness happened
      } catch(error) {
        reject(error);
      }
    }.bind(this));
  }

  /**
   * This is what elements call
   */
  callMethod() {
    if( !this._events[arguments[0]] ) {
      throw new Error(`No global method registered: ${arguments[0]}`);
    }

    var args = [arguments[0]];

    return new Promise((resolve, reject) => {
      args.push(resolve);
      args.push(reject);

      for( var i = 1; i < arguments.length; i++ ) {
        args.push(arguments[i]);
      }

      super.emit.apply(this, args);
    });
  }

}

module.exports = new EventBus();