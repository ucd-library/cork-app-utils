# BaseModel

The BaseModel exposes the ReduxStore and EventBus to classes as well as adds helper methods for access redux state and emiting events to the event bus.

### Attributes

 - store : ReduxStore
 - eventBus : EventBus

### Methods

 - emit(event: String, payload: Object)
   - Emit event to event bus
 - dispatch(action: Object)
   - Dispatch action to ReduxStore
 - getState()
   - Shortcut for access ReduxStore state

# EventController

The EventController is a base class for controllers which adds helpers for binding to EventBus events as well as emiting events to the EventBus.

### Attributes
  
  - eventBus : EventBus
  - observer : redux-observer

### Methods

  - bind()
    - wire up ```handleEvents``` definition.  See example below.
  - emit(event: String, payload: Object)
    - Emit event to event bus

### Example Usage

```javascript
var EventController = require('cork-app-utils').EventController;
var model = require('../models/MyModel');


class MyController extends EventController {

  constructor() {
    super();

    /***
     * The handleEvents object will be used by the bind method.
     * The object 'key' is the method to call.
     * The object 'value' is the event to bind the method to
     *
     * The method will be passed a single object, the event payload.
     * The method can return a promise or a value
     ***/
    this.handleEvents = {
      update : 'update-event',
      get : 'get-event'
    }

    this.triggerEvents = {
      updateEvent : 'on-update'
    }

    this.bind();
  }

  /**
   * Binds to update-event
   **/
  update(e) {
    return model.update(e.value);
  }

  /**
   * Binds to get-event
   **/
  get() {
    return model.get();
  }

  /**
   * Should be called from your redux observer function.
   * Sends observed state change to EventBus
   **/
  updateObserver(state) {
    this.emit(this.triggerEvents.updateEvent, state);
  }
}

module.exports = new MyController();
```

# EventBus

Global instance of EventEmitter class.

