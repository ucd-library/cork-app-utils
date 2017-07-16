var eventBus = require('./EventBus');
var store = require('../redux/store');
var _store;

class BaseModel {

  get store() {
    if( !_store ) _store = store();
    return _store;
  }

  get eventBus() {
    return eventBus;
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