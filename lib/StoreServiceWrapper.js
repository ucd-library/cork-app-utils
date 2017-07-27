class StoreServiceWrapper {

  /**
   * Help make service calls updating store w/ result
   * 
   * @param {Object} options
   * @param {Object} options.request - superagent promise
   * @param {Function} options.store - Store class
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   * @param {Function} options.onSuccessMiddleware - method will be called before onSuccess, result is passed to onSuccess
   */
  static call(options) {
    options
      .request
      .then(resp => {
        if( resp.status !== 200 || (resp.body && resp.body.error) ) {
          options.onError.call(options.store, resp.payload);
        } else {
          if( options.onSuccessMiddleware ) {
            options.onSuccess.call(options.store, options.onSuccessMiddleware(resp.body));
          }

          options.onSuccess.call(options.store, resp.body);
        }
      })
      .catch(e => options.onError.call(options.store, e));
  }
}

module.exports = StoreServiceWrapper;