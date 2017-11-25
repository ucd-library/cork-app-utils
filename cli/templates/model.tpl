const {BaseModel} = require('@ucd-lib/cork-app-utils');
const {{name}}Service = require('../services/{{name}}Service');
const {{name}}Store = require('../stores/{{name}}Store');

class {{name}}Model extends BaseModel {

  constructor() {
    super();

    this.store = {{name}}Store;
    this.service = {{name}}Service;
      
    this.register('{{name}}Model');
  }

}

module.exports = new {{name}}Model();