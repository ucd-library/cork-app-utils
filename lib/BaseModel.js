var eventBus = require('./EventBus');
var IcoRegistration = require('./IocRegistration');

class BaseModel extends IcoRegistration {

  get eventBus() {
    return eventBus;
  }

  emit(event, payload) {
    this.eventBus.emit(event, payload);
  }
}

module.exports = BaseModel;