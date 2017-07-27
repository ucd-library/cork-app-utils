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
    if( !options.store ) {
      if( this.store ) options.store = this.store;
      else return console.error(new Error('No store provided'));
    }

    return new Promise((resolve, reject) => {
      options.resolve = resolve;
      options.reject = reject;

      return StoreSerivceWrapper.call(options);
    });
  }

}

module.exports = BaseService;