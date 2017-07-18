var eventBus = require('./EventBus');
var store = require('./redux/store');
var _store;

class BaseModel {

  get store() {
    if( !_store ) _store = store();
    return _store;
  }

  get eventBus() {
    return eventBus;
  }

  bindMethods() {
    var className = this.__proto__.constructor.name;
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

  dispatch(action) {
    this.store.dispatch(action);
  }

  getState() {
    return this.store.getState();
  }

}

module.exports = BaseModel;