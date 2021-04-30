/**
 * @class Registry
 * 
 * @description The Registry stores references to the application Models.
 */
class Registry {

  constructor() {
    this.models = {};
    this.onLoadHandlers = [];
    this.injectHandlers = [];
    this.isReady = false;
  }

  /**
   * @method addLoadHandler
   * @description register a handler for when all models are loaded
   * 
   * @param {Function} handler 
   */
  addLoadHandler(handler) {
    if( this.isReady === true ) {
      return handler();
    }
    this.onLoadHandlers.push(handler);
  }

  /**
   * @method addInjectHandler
   * @description register a handler for injecting model
   * 
   * @param {Function} handler 
   */
  addInjectHandler(handler) {
    if( this.isReady === true ) {
      throw new Error('addInjectHandler needs to be called before ready()');
    }
    this.injectHandlers.push(handler);
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

  /**
   * @method ready
   * @description call this function after you have imported all models. 
   * Will allow other models to inject siblings
   */
  ready() {
    for( let handler of this.injectHandlers ) {
      handler(this);
    }

    this.isReady = true;
    for( let handler of this.onLoadHandlers ) {
      handler(this);
    }
  }
}

const registery = new Registry();
export default registery;