# BaseModel

The BaseModel exposes the event bus and has helper methods
for registering with the MasterController.  This global object
is used by Element interface mixins to inject the models into
elements.

### Attributes

 - eventBus : EventBus

### Methods

 - register(name: String)
   - Register model with the MasterController
 - emit(event: String, payload: Object)
   - Emit event to event bus

### Example Usage

```javascript
const {BaseModel} = require('cork-app-utils');
const ExampleStore = require('../stores/ExampleStore');
const ExampleService = require('../service/ExampleService');

class ExampleModel extends BaseModel {

  constructor() {
    super();

    this.store = ExampleStore;
    this.service = ExampleService;

    this.register('ExampleModel');
  }

  /**
   * @method get
   * @description In this example we will fetch some data
   * using our service.  The service may return some
   * data already cached in the store.  The returned 
   * data will be in a State Payload Wrapper.
   *
   * @returns {Promise}
   */
  async get(id) {
    // wait for the service to do it's thing
    // if you are interested in the loading events
    // you will want to set event listeners
    await this.service.get(id);

    return this.store.get(id);
  }

  /**
   * @method set
   * @description Update some app state
   */
  set(data) {
    this.store.update(data)
  }
}

module.exports = new ExampleModel();
```

# BaseService

The BaseService exposes helper functions to call rest services

### Attributes

 - eventBus : EventBus

### Methods

 - request(options: Object)
   - Make a fetch request

### Example Usage

```javascript
const {BaseService} = require('cork-app-utils');
const ExampleStore = require('../stores/ExampleStore');

class ExampleService extends BaseService {

  constructor() {
    super();

    this.store = ExampleStore;
  }

  async get(id) {
    return this.request({
      url : `/api/get/${id}`,
      checkCached : () => this.store.data.byId[id],
      onLoading : request => this.store.setLoading(id, request),
      onLoad : result => this.store.setLoaded(id, result.body),
      onError : e => this.store.setError(id, e)
    });
  }
}

module.exports = new ExampleService();
```

# BaseStore

The ServiceModel exposes helper functions to call rest services

### Attributes

 - eventBus : EventBus

### Methods

 - request(options: Object)
   - Make a fetch request

### Example Usage

```javascript
const {BaseStore} = require('cork-app-utils');

class ExampleStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byId : {}
    }

    this.events = {
      EXAMPLE_UPDATE = 'example-update'
    }
  }

  setLoading(id, promise) {
    this._setState({
      state: this.STATE.LOADING, 
      id: id,
      request : promise
    });
  }

  setLoaded(id, payload) {
    this._setState({
      state: this.STATE.LOADED,   
      id: id,
      payload: payload
    });
  }

  setError(id, e) {
    this._setState({
      state: this.STATE.ERROR,   
      id: id,
      error: e
    });
  }

  _setState(id, state) {
    this.data.byId[id] = state
    this.emit(this.events.EXAMPLE_UPDATE, state);
  }
}

module.exports = new ExampleStore();
```


# MasterController

Global instance of EventEmitter class with map of model names
to model instances.

# Wiring to UI

This example will use Polymer and the [cork-common-utils](https://github.com/cork-elements/cork-common-utils) elements
to create a mixin class (interface) that can be added to multiple elements.

## Interface Mixin Class Creation

```js

module.exports = subclass => 

  class ExampleInterface extends subclass {

      constructor() {
        this._injectModel('ExampleModel');
      }

      _setExample(update) {
        this.ExampleModel.update(update);
      }

      async _getExample(id) {
        return this.ExampleModel.get(id);
      }

      // automatically binds element to example-update event.
      _onExampleUpdate(e) {
        // implement me
      }
  }
```

## Using mixin with Polymer 3.0 element

```js
import {Element as PolymerElement} from "@polymer/polymer/polymer-element"

// sets globals Mixin and EventInterface
import "@ucd-lib/cork-app-utils";

import ExampleInterface from "./interfaces/ExampleInterface"

export default class MyElement extends Mixin(Polymer.Element)
  .with(EventInterface, ExampleInterface) {

  constructor() {
    // by default all EventInterface elements have an active flag
    // that is set to false.  This flag must be set to true to 
    // or all store events will be ignored.  You can use iron-pages
    // or the like to be more clever with this flag and control
    // when elements are active and responding to events.
    this.active = true;
  }

  render(id) {
    // _getExample added from ExampleInterface
    let data = await this._getExample('someId');
    // you can do stuff with
  }

  // EventInterface will automatically wire up this method
  // to the example-update event.
  _onExampleUpdate(e) {
    if( e.state === 'loading' ) {

    } else if( e.state === 'loaded' ) {

    } else if( e.state === 'error' ) {

    }
  }

  _setExample() {
    this._setExample({
      my : 'new state'
    });
  }
}

customElements.define('my-element', MyElement);
```

