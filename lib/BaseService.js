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
   * @param {Function} options.checkCached - return object to see if in loaded or loading 
   * @param {Function} options.store - Store class (options, will default to this.store)
   * @param {Function} options.onLoading - Store class method to call onLoad start
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   */
  call(options) {
    // inject class store if none provided
    if( !options.store ) {
      if( this.store ) options.store = this.store;
      else return console.error(new Error('No store provided'));
    }

    if( options.checkCached  ) {
      // return object if loaded
      var cachedObject = options.checkCached();

      if( this.isLoaded(cachedObject) ) {
        return cachedObject;
      
      // return stored promise if loading
      } else if( this.isLoading(cachedObject) ) {
        if( !cachedObject.request ) {
          throw new Error('checkCached set but no request object found', cachedObject)
        }
        return cachedObject.request;
      }
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
    if( !this.store ) {
      return console.warn('Checking LOADED state but no store set for service');
    }

    if( object && object.state === this.store.STATE.LOADED ) {
      return true;
    }
    return false;
  }

  /**
   * Checks if object exists and has state equal to the stores
   * loading state
   */
  isLoading(object) {
    if( !this.store ) {
      return console.warn('Checking LOADED state but no store set for service');
    }
    
    if( object && object.state === this.store.STATE.LOADING ) {
      return true;
    }
    return false;
  }

}

module.exports = BaseService;