var eventBus = require('./EventBus');

class BaseModel {

  get eventBus() {
    return eventBus;
  }

  /**
   * Have to pass name for IE support.
   */
  bindMethods(name) {
    if( !name ) {
      console.warn('Name not passed to bindMethods().  This will fail in IE, cause, you know, IE.')
    }

    var className = this.__proto__.constructor.name || name;
    var methods = Object.getOwnPropertyNames(this.__proto__);
    methods.forEach((method) => {
      if( method === 'constructor' ) return;

      this._bindMethod(method, className+'.'+method)
    });
  }

  _bindMethod(method, event) {
    this.eventBus.on(event, function() {

      var resolve = arguments[0];
      var reject = arguments[1];

      var args = [];
      for( var i = 2; i < arguments.length; i++ ) {
        args.push(arguments[i]);
      }

      try {
        var resp = this[method].apply(this, args);

        // method returned a promise, just wait for it to resolve
        if( resp && typeof resp === 'object' && typeof resp.then === 'function' ) {
          resp
            .then(() => resolve.apply(null, arguments))
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

  emit(event, payload) {
    return new Promise((resolve, reject) => {
      this.eventBus.emit(event, payload, resolve, reject);
    });
  }

}

module.exports = BaseModel;