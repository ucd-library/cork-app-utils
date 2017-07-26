var EventBus = require('./EventBus');

class BaseStore {

  get eventBus() {
    return eventBus;
  }

  emit(event, payload) {
    this.eventBus.emit(event, payload);
  }
}

module.exports = BaseStore;