import {BaseModel} from '@ucd-lib/cork-app-utils';
import {{name}}Service from '../services/{{name}}Service.js';
import {{name}}Store from '../stores/{{name}}Store.js';

class {{name}}Model extends BaseModel {

  constructor() {
    super();

    this.store = {{name}}Store;
    this.service = {{name}}Service;
      
    this.register('{{name}}Model');
  }

}

const model = new {{name}}Model();
export default model;