var EventEmitter = require('events').EventEmitter;

/**
 * @class MasterController
 * 
 * @description This is the global object that acts as a event bus for all models and 
 * elements, allowing stores to notify elements of application state updates.  Elements
 * and models can use this as a open communication platform as well.  
 * 
 * The MasterController also stores references to the application Models.
 */
class MasterController extends EventEmitter {

  constructor() {
    super();
    
    // setup event bus listeners.
    // TODO: should this be configurable?
    this.setMaxListeners(10000);

    // global reference for models
    this.models = {}
  }

  /**
   * @method registerModel
   * @description Register a model.  This is called from the BaseModel classes register() method.
   * 
   * @param {String} name model name
   * @param {Object} model the model object to register
   */
  registerModel(name, model) {
    if( this.models[name] ) {
      throw new Error(`A model has already been registered with name: ${name}`);
    }

    this.models[name] = model;
  }

  /**
   * @method getModel
   * @description Get a globally registered model.  Normally called by a elements interface mixin.
   * Sometimes called by another model to avoid cyclical depenency issues.
   * 
   * Throws error if model does not exist
   * 
   * @param {String} name model name to get
   * @returns {Object} model object
   */
  getModel(name) {
    if( !this.models[name] ) {
      throw new Error(`No model has been registered with name: ${name}`);
    }

    return this.models[name];
  }
}

module.exports = new MasterController();