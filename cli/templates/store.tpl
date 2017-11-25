const {BaseStore} = require('@ucd-lib/cork-app-utils');

class {{name}}Store extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

module.exports = new {{name}}Store();