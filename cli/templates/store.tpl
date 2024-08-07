import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class {{name}}Store extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

const store = new {{name}}Store();
export default store;