var eventBus = require('./EventBus');

class IocRegistration {

  registerIOC(name) {
    if( !name ) {
      console.warn('Name not passed to bindMethods().  This will fail in IE, cause, you know, IE.')
    }

    var className = name || this.__proto__.constructor.name;
    eventBus.registerIOC(className, this);
  }

}

module.exports = IocRegistration;