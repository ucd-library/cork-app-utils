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
   * @param {Function} options.store - Store class
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   * @param {Function} options.onSuccessMiddleware - method will be called before onSuccess, result is passed to onSuccess
   * @param {Function} options.resolve - resolve a promise when complete (optional)
   * @param {Function} options.reject - reject a promise on error (optional)
   */
  call(options) {
    return StoreSerivceWrapper.call(options);
  }

}

module.exports = BaseService;