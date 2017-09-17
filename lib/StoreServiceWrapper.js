class StoreServiceWrapper {
  
  /**
   * Help make service calls updating store w/ result
   * 
   * @param {Object} options
   * @param {Object} options.request - superagent promise
   * @param {Function} options.store - Store class
   * @param {Function} options.onLoading - Store class method to call onLoad start
   * @param {Function} options.onError - Store class method to call onError
   * @param {Function} options.onSuccess - Store class method to call onSuccess
   * @param {Function} options.resolve - resolve a promise when complete (optional)
   * @param {Function} options.reject - reject a promise on error (optional)
   */
  static call(options) {
    if( options.onSuccessMiddleware ) {
      console.error('StoreServiceWrapper onSuccessMiddleware no longer supported');
    }

    if( options.onLoading ) options.onLoading(options.request);

    options
      .request
      .then(resp => {
        // response set back erro
        if( (resp.status >= 300) || (resp.body && resp.body.error) ) {

          resp = resp.body || {status: resp.status};
          options.onError(resp);
          if( options.reject ) options.reject(resp);

        } else {
          var result = options.onSuccess(resp.body);
          var storeValue = getStoreValue(options);

          if( options.resolve ) options.resolve(storeValue || result || resp.body);
        }
      })
      .catch(e => {
        var result = options.onError(e);
        var storeValue = getStoreValue(options);

        if( options.reject ) options.reject(storeValue || result || e);
      });
  }
}

function getStoreValue(options) {
  if( options.checkCached ) return options.checkCached();
  else return null;
}

  
module.exports = StoreServiceWrapper;