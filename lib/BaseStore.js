var MasterController = require('./MasterController');

/**
 * @class BaseStore
 * @description All stores should extend this class.  It really provides two simple 
 * things.  First a emit() method for firing events that are async.  Second, it
 * provides standard STATE names for data payload wrappers.  Store data in similar way
 * really helps the reactive side of the app.
 * 
 * Example
 * 
 * class MyStore extends BaseStore {
 * 
 *   constructor() {
 *     super();
 *     
 *     this.data = {
 *       aSingleThing : {
 *         state : this.STATE.INIT
 *       }
 *     }
 *     
 *     // these events will be automatically bound to elements
 *     this.events = {
 *       THING_UPDATED : 'thing-updated'
 *     }
 *   }
 *   
 *   // promise is the request promise
 *   setThingLoading(promise) {
 *      this.updateThing({state: this.STATE.LOADING, request: promise});
 *   }
 * 
 *   setThingLoaded(newData) {
 *      this.updateThing({state: this.STATE.LOADED, payload: newData});
 *   }
 * 
 *   setThingError(err) {
 *      this.updateThing({state: this.STATE.ERROR, error: err});
 *   }
 *   
 *   // actually set data state and fire event
 *   updateThing(data) {
 *     this.data.aSingleThing = data;
 *     this.emit(this.events.THING_UPDATED, this.data.aSingleThing);
 *   }
 * 
 * }
 * 
 */
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

  /**
   * @method emit
   * @description Fire a async event on MasterController event bus.
   * 
   * @param {String} event event name
   * @param {Object} payload event payload
   */
  emit(event, payload) {
    // make events async
    setTimeout(() => {
      MasterController.emit(event, payload);
    }, 0);
  }
}

module.exports = BaseStore;