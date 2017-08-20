var request = require('superagent');
var StoreSerivceWrapper = require('./StoreServiceWrapper');

class BaseService {

  constructor() {
    this.request = request;
  }

  /**
   * Help make service calls updating store w/ result
   * 
   * @param {Object} options
   * @param {Object} options.request - superagent promise
   * @param {Object} options.params - optional parameters to pass along to store
   * @param {Function} options.store - Store class (options, will default to this.store)
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   * @param {Function} options.onSuccessMiddleware - method will be called before onSuccess, result is passed to onSuccess
   */
  call(options) {
    // inject class store if none provided
    if( !options.store ) {
      if( this.store ) options.store = this.store;
      else return console.error(new Error('No store provided'));
    }

    // if we were give promise functions to resolve, use those
    if( options.resolve && options.reject ) {
      return StoreSerivceWrapper.call(options);
    } 

    // otherwise, use our own promise
    return new Promise((resolve, reject) => {
      options.resolve = resolve;
      options.reject = reject;

      StoreSerivceWrapper.call(options);
    });
  }

  /**
   * Checks if object exists and has state equal to the stores
   * loaded state
   */
  isLoaded(object) {
    if( object && object.state === this.store.STATE.LOADED ) {
      return true;
    }
    return false;
  }

}

module.exports = BaseService;