const {BaseService} = require('@ucd-lib/cork-app-utils');
const {{name}}Store = require('../stores/{{name}}Store');

class {{name}}Service extends BaseService {

  constructor() {
    super();
    this.store = {{name}}Store;
  }

}

module.exports = new {{name}}Service();