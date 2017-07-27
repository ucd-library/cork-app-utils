class StoreServiceWrapper {

  /**
   * Help make service calls updating store w/ result
   * 
   * @param {Object} options
   * @param {Object} options.request - superagent request
   * @param {Function} options.store - Store class
   * @param {Function} options.onError - Store class method to call on success
   * @param {Function} options.onSuccess - Store class method to call on error
   */
  static call(options) {
    options
      .request
      .then(resp => {
        if( resp.status !== 200 || (resp.body && resp.body.error) ) {
          options.onError.call(options.store, resp.payload);
        } else {
          options.onSuccess.call(options.store, resp.body);
        }
      })
      .catch(e => options.onError.call(options.store, e));
  }
}

module.exports = StoreServiceWrapper;