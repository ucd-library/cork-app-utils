var MasterController = require('./MasterController');

class BaseStore {

  constructor() {
    // general states that should be used if possible
    this.STATE = {
      INIT         : 'init',
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

  get MasterController() {
    return MasterController;
  }

  emit(event, payload) {
    // make events async
    setTimeout(() => {
      this.MasterController.emit(event, payload);
    }, 0);
  }
}

module.exports = BaseStore;