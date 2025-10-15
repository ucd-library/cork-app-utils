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
 * import MyStore from '../stores/MyStore';
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
    this.rootUrl = '';
    if( typeof window !== 'undefined' ) {
      this.rootUrl = window.location.protocol+'//'+window.location.host;
    }

    this.ERROR_MESSAGES = {
      REQUEST : 'Request Error',
      STATUS_CODE : 'Invalid status code',
      JSON : 'Invalid JSON response',
      APPLICATION_ERROR : 'Application Error'
    }
  }

  set store(store) {
    this._store = store;
    store.init();
  }

  get store() {
    return this._store;
  }

  /**
   * @method request
   * @description Help make service calls updating store w/ result.  All parameters are optional
   * but the request parameter.
   * 
   * @param {Object} options
   * @param {Object} options.url - request url
   * @param {Object} options.fetchOptions - fetch api options
   * @param {Object} options.qs - query string object to append to url
   * @param {Boolean} options.json - if posting json set true, will automatically stringify body and set correct content type
   * @param {Function} options.checkCached - return object to see if in loaded or loading (see BaseStore States)
   * @param {Function} options.store - Store class (options, will default to this.store)
   * @param {Function} options.onLoading - Store class method to call onLoad start
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onLoad - Store class method to call onLoad
   * @param {Function} options.onUpdate - Called after onLoading, onError, onLoad
   * 
   * @returns {Promise}
   */
  async request(options) {
    // inject class store if none provided
    if( !options.store ) {
      if( this.store ) options.store = this.store;
      else return console.error(new Error('No store provided'));
    }

    // default to include all cookies
    if( !options.fetchOptions ) options.fetchOptions = {};
    if( !options.fetchOptions.credentials ) {
      options.fetchOptions.credentials = 'include';
    }

    // if json flag, stringify body, set content type
    if( options.json && 
        options.fetchOptions &&
        options.fetchOptions.body &&
        typeof options.fetchOptions.body === 'object') {
  
      options.fetchOptions.body = JSON.stringify(options.fetchOptions.body);
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      options.fetchOptions.headers['Content-Type'] = 'application/json'
    }

    // append query string url
    if( options.qs ) {
      let qs = [];
      for( var key in options.qs) {
        qs.push(`${key}=${encodeURIComponent(options.qs[key])}`);
      }
      options.url += '?'+qs.join('&');
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

    let promise = this._request(options);
    if( options.onLoading ) options.onLoading(promise);
    if( options.onUpdate ) options.onUpdate({request: promise});

    return await promise;
  }

  _request(options) {
    if( !options.fetchOptions ) {
      options.fetchOptions = {};
    }

    return new Promise(async (resolve, reject) => {
      var response = null;

      try {
        response = await fetch(options.url, options.fetchOptions)
      } catch(e) {
        return this._handleError(
          options, resolve,
          { 
            error: true, 
            details: e, 
            response,
            message: this.ERROR_MESSAGES.REQUEST
          }
        );
      }

      if( response.status < 200 || response.status > 299 ) {
        return this._handleError(
          options, resolve,
          { 
            error: true, 
            response: response, 
            message: this.ERROR_MESSAGES.STATUS_CODE
          }
        );
      }

      if( (response.headers.has('Content-Type') && 
        response.headers.get('Content-Type').match(/application\/json/i)) || options.json ) {
        
        var body = null;
        try {
          body = await response.text();
          body = JSON.parse(body);
        } catch(e) {
          return this._handleError(
            options, resolve,
            { 
              error: true, 
              details: e,
              response: response,
              message: this.ERROR_MESSAGES.JSON
            }
          );
        }

        // you can get a null body from response.json();
        if( body === null ) {
          body = {
            error: true,
            message: 'null body response from service'
          };
        }

        if( body.error ) {
          return this._handleError(
            options, resolve,
            { 
              error: true, 
              details: body,
              response : response,
              message: this.ERROR_MESSAGES.APPLICATION_ERROR
            }
          );
        }
      } else {
        body = await response.text();
      }

      if( options.onLoad ) options.onLoad({response, body});
      if( options.onUpdate ) options.onUpdate({payload: body});
      resolve({response, body});
    });
  }

  async _handleError(options, resolve, error) {
    if( error.response && !error.payload ) {
      try {
        error.payload = await error.response.text();
        if( error.response.headers.has('Content-Type') && 
          error.response.headers.get('Content-Type').match(/application\/json/i) ) {
          try {
            error.payload = JSON.parse(error.payload);
          } catch(e) {}
        }
      } catch(e) {}
    }

    if( options.onError ) options.onError(error);
    if( options.onUpdate ) options.onUpdate({error});
    resolve(error);
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

  /**
   * @method checkRequesting
   * @description Helper method to check if object is already requesting, if so
   * wait for request to finish before proceeding. If not requesting, call request
   * method.
   * 
   * @param {String} id - id of object to check
   * @param {Object} store - store object to check
   * @param {Function} request - request method to call if object not requesting
   * 
   * @returns {Promise}
   */
  async checkRequesting(id, store, request) {
    let item = store.get(id);

    if( this.isLoading(item) ) {
      await item.request;
    } else {
      await request();
    }
  }

}

export {BaseService};