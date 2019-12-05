const EventBus = require('./EventBus');
const Registry = require('./Registry');

/**
 * @class BaseModel
 * 
 * @description This class should be extended by all app models.  This will allow models to
 * be registered with the global Registry.  Once registered; models can access other
 * models w/o worry of cyclical dependency issues, interface mixins can add models via model name
 * and automatically bind to events of interest.
 * 
 * If a model has a store, it should be set to the models this.store in the contructor.  This
 * allows teh EventInterface to automatically bind to both model and store events (most events
 * will be fired from the store on state update).
 * 
 * The other common pattern is to set this.service to the model service if one exists.
 * 
 * Example:
 * 
 * const MyStore = require('../stores/MyStore');
 * const MyService = require('../service/MyService');
 * 
 * class MyModel extends BaseModel {
 *  
 *   constructor() {
 *     super();
 *     this.store = MyStore;
 *     this.service = MyService;
 *   }
 * 
 *   async doCoolThings(args) {
 *     // some buisness logic here    
 *  
 *     // most services should return a promise so caller can handle success/promise
 *     // without having to watch for store state update events.
 *     return this.service.getCoolThing(args);
 *   }
 * }
 */
class BaseModel {

  /**
   * @property EventBus
   * @description get the EventBus object
   */
  get EventBus() {
    return EventBus;
  }

  /**
   * @method register
   * 
   * @description Register a Model by name with the Registry.  Note, the name is required
   * to be compatible with IE.
   * @param {String} name Model name.  This name will be used by interfaces wishing to inject the model
   */
  register(name) {
    if( !name ) {
      console.warn('Name not passed to register().  This will fail in IE, cause, you know, IE.')
    }

    var className = name || this.__proto__.constructor.name;
    Registry.registerModel(className, this);
  }

  /**
   * @method _injectModel
   * @description Add model reference to this object.
   *
   * @param {String} names Model name to inject and bind to events 
   */
  inject(...names) {
    names.forEach(name => {
      this[name] = Registry.getModel(name);
    });
  }

  /**
   * @method emit
   * @description Send a event on the EventBus event bus.
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
}

module.exports = BaseModel;