import {EventEmitter} from 'events';

/**
 * @class EventBus
 * 
 * @description This is the global object that acts as a event bus for all models and 
 * elements, allowing stores to notify elements of application state updates.  Elements
 * and models can use this as a open communication platform as well.  
 */
class EventBus extends EventEmitter {

  constructor() {
    super();

    let maxListeners = 10000;
    if( typeof window !== 'undefined' ) {
      if( window.EVENT_BUS_MAX_LISTENERS ) {
        maxListeners = window.EVENT_BUS_MAX_LISTENERS;
      }
    }
    
    // setup event bus listeners.
    this.setMaxListeners(maxListeners);
  }
}

const eventBus = new EventBus();
export default eventBus;