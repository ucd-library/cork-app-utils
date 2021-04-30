import {BaseService} from '@ucd-lib/cork-app-utils';
import {{name}}Store from '../stores/{{name}}Store.js';

class {{name}}Service extends BaseService {

  constructor() {
    super();
    this.store = {{name}}Store;
  }

}

const service = new {{name}}Service();
export default service;