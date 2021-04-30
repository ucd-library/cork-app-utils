const EventBus = require('./EventBus');
const deepEqual = require('fast-deep-equal');

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
 *     // new state is same as old state, just quit out
 *     if( !this.stateChanged(this.data.aSingleThing, data) ) return;
 * 
 *     this.data.aSingleThing = data;
 *     this.emit(this.events.THING_UPDATED, this.data.aSingleThing);
 *   }
 * 
 * }
 * 
 */
class BaseStore {

  constructor() {
    this.lruTimers = {};

    // general states that should be used if possible
    this.STATE = {
      INIT         : 'init',
      LOADING      : 'loading',
      LOADED       : 'loaded',
      ERROR        : 'error',
      SAVING       : 'saving',
      SAVE_ERROR   : 'save-error',
      SAVE_SUCCESS : 'save-success',
      DELETING     : 'deleting',
      DELETE_ERROR : 'delete-error',
      DELETED      : 'deleted'
    }
  }

  get EventBus() {
    return EventBus;
  }

  /**
   * @method emit
   * @description Fire a async event on EventBus event bus.
   * 
   * @param {String} event event name
   * @param {Object} payload event payload
   */
  emit(event, payload) {
    // make events async
    setTimeout(() => {
      EventBus.emit(event, payload);
    }, 0);
  }

  /**
   * @method stateChanged
   * @description given two state objects, check there is a difference
   * between them.  This is a deep check, not a direct object comparison.
   * 
   * @param {Object} currentState objects currently store state
   * @param {Object} newState new state for object
   * 
   * @returns {Boolean}
   */
  stateChanged(currentState, newState) {
    if( !currentState && newState ) return true;
    if( currentState && !newState ) return true;
    if( !currentState && !newState ) return false;
    if( currentState.state !== newState.state ) return true;
    return !deepEqual(currentState, newState);
  }

  /**
   * @method lruUpdate
   * @description set store state using lru methodology.
   * 
   * @param {String} storeDatakey this.data[storeDatakey] key
   * @param {String} id value id for store
   * @param {Object} value the actual value
   * @param {Number} max max number of items to store.  Defaults to 20. 
   */
  lruUpdate(storeDatakey, id, value, max=20) {
    let storeData = this.data[storeDatakey];
    value.updated = Date.now();
    storeData[id] = value;

    if( Object.keys(storeData).length <= max ) return;

    let lruTimer = this.lruTimers[storeDatakey] || -1;
    if( lruTimer !== -1 ) clearTimeout(lruTimer);
    this.lruTimers[storeDatakey] = setTimeout(() => {
      this.lruTimers[storeDatakey] = -1;
      this._cleanLruData(storeData, max);
    }, 100);
  }

  /**
   * @method _cleanLruData
   * @description if a store has exceeded the max number of allowed items, remove
   * the oldest
   * 
   * @param {Object} storeData 
   * @param {Number} max 
   */
  _cleanLruData(storeData, max) {
    let arr = [];
    for( let id in storeData ) {
      arr.push({id, value: storeData[id]});
    }
  
    arr.sort((a, b) => {
      if( a.value.updated < b.value.updated ) return 1;
      if( a.value.updated > b.value.updated ) return -1;
      return 0;
    });

    arr.splice(max, arr.length)
      .forEach(item => delete storeData[item.id]);
  }
}

module.exports = BaseStore;