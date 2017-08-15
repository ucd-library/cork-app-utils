var eventBus = require('./EventBus');

class BaseModel {

  get eventBus() {
    return eventBus;
  }

  registerIOC(name) {
    if( !name ) {
      console.warn('Name not passed to bindMethods().  This will fail in IE, cause, you know, IE.')
    }

    var className = name || this.__proto__.constructor.name;
    eventBus.registerIOC(className, this);
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

      this._bindMethod(className+'.'+method, method)
    });
  }

  _bindMethod(globalName, method) {
    this.eventBus.handleMethod(globalName, this[method].bind(this));
  }

  emit(event, payload) {
    this.eventBus.emit(event, payload);
  }

}

module.exports = BaseModel;