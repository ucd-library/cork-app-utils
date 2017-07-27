var request = require('superagent');
var StoreSerivceWrapper = require('./StoreServiceWrapper');

class BaseService {

  call(options) {
    return StoreSerivceWrapper.call(options);
  }

}

module.exports = BaseService;