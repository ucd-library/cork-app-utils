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
      eventBus.on(className+'.'+method, () => {
        this[method].call(this, arguments);
      });
    });
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