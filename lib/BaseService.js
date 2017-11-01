var request = require('request');

/**
 * @class BaseService
 * @description Base class for services.  Adds promise based request with helpers for
 * checking the store to see if a object is already loaded.  Also has wrapper for checking
 * response for errors, rejecting promise if error condition is tripped.
 * 
 * Most methods making a request should return the promise so other Models/Elements can bind
 * to the handling of the promise
 * 
 * Example:
 * 
 * const MyStore = require('../stores/MyStore');
 * 
 * class MyService extends BaseService {
 *  
 *   constructor() {
 *     super();
 *     this.store = MyStore;
 *   }
 * 
 *   async doCoolThing(id) {     
 *     return await this.request({
 *       request : {
 *         method : 'GET',
 *         uri    : '/some/api/get?id='+id
 *       },
 *       checkCached : () => this.store.data.byId[id],
 *       onLoading : (promise) => this.store.setCoolThingLoading(promise),
 *       onLoad : ({response, body}) => this.store.setCoolThingLoaded(body),
 *       onError : (err) => this.store.setCoolThingError(err)
 *     });
 *   }
 * 
 * }
 * 
 */
class BaseService {

  constructor() {
    this.request = request;

    this.ERROR_MESSAGES = {
      REQUEST : 'Request Error',
      STATUS_CODE : 'Invalid status code',
      JSON : 'Invalid JSON response',
      APPLICATION_ERROR : 'Application Error'
    }
  }

  /**
   * @method request
   * @description Help make service calls updating store w/ result.  All parameters are optional
   * but the request parameter.
   * 
   * @param {Object} options
   * @param {Object} options.request - request options
   * @param {Function} options.checkCached - return object to see if in loaded or loading (see BaseStore States)
   * @param {Function} options.store - Store class (options, will default to this.store)
   * @param {Function} options.onLoading - Store class method to call onLoad start
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   * 
   * @returns {Promise}
   */
  async request(options) {
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

    let promise = this._request(options.request);
    if( options.onLoading ) options.onLoading(promise);

    return await promise;
  }

  async _request(options) {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        // there was an error with the request
        if( error ) {
          return this._handleError(
            options, reject,
            { 
              error: true, 
              details: error, 
              message: this.ERROR_MESSAGES.REQUEST
            }
          );
        }

        if( response.statusCode < 200 || response.statusCode > 299 ) {
          return this._handleError(
            options, reject,
            { 
              error: true, 
              details: response, 
              message: this.ERROR_MESSAGES.STATUS_CODE
            }
          );
        }

        // helper for JSON response
        if( response.headers['Content-Type'] === 'application/json' ) {
          try {
            body = JSON.parse(body);
          } catch(e) {
            return this._handleError(
              options, reject,
              { 
                error: true, 
                details: e, 
                message: this.ERROR_MESSAGES.JSON
              }
            );
          }

          if( body.error ) {
            return this._handleError(
              options, reject,
              { 
                error: true, 
                details: body, 
                message: this.ERROR_MESSAGES.APPLICATION_ERROR
              }
            );
          }
        }

        if( options.onLoad ) options.onLoad({response, body});
        resolve({response, body});
      });
    });
  }

  _handleError(options, reject, error) {
    if( options.onError ) options.onError(error);
    reject(error);
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