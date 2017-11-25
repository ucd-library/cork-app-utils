module.exports = subclass => 
  class {{name}}Interface extends subclass {

    constructor() {
      super();
      this._injectModel('{{name}}Model');
    }

  }