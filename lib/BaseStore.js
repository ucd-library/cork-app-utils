import EventBus from './EventBus.js';
import deepEqual from 'fast-deep-equal';
import STATES from './states.js';

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
    // general states that should be used if possible
    this.STATE = STATES;
  }

  get EventBus() {
    return EventBus;
  }

  /**
   * @method set
   * @description Set data in a store.  This is a simple wrapper around the store's set
   * method.  It enforces that the payload has an id and state and that the store is 
   * passed
   * 
   * @param {Object} payload required
   * @param {LruStore} store LruStore object
   * @param {String} eventName optional event name to fire.  Defaults to store name + '-updated'
   */
  set(payload, store, eventName) {
    if( !payload.id ) {
      throw new Error('Cannot set data without an id');
    }
    if( !payload.state ) {
      throw new Error('Cannot set data without a state');
    }
    if( !store ) {
      throw new Error('Cannot set data without a store');
    }

    store.set(payload.id, payload);
    if( !eventName ) {
      eventName = store.name.replace(/[\s\._]/g, '-').toLowerCase() + '-update';
    }
    
    this.emit(eventName, payload);
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
}

export {BaseStore};