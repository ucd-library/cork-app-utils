var EventBus = require('./EventBus');

class BaseStore {

  constructor() {
    // general states that should be used if possible
    this.STATE = {
      LOADING      : 'loading',
      LOADED       : 'loaded',
      ERROR        : 'error',
      SAVING       : 'saving',
      SAVE_ERROR   : 'save-error',
      DELETING     : 'deleting',
      DELETE_ERROR : 'delete-error',
      DELETED      : 'deleted'
    }
  }

  get eventBus() {
    return eventBus;
  }

  emit(event, payload) {
    this.eventBus.emit(event, payload);
  }
}

module.exports = BaseStore;