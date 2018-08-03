const EventEmitter = require('events').EventEmitter;

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
    
    // setup event bus listeners.
    // TODO: should this be configurable?
    this.setMaxListeners(10000);
  }
}

module.exports = new EventBus();