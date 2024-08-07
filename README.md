# Cork App Utils

- [Install](#install)
- [BaseModel](#basemodel)
- [BaseService](#baseservice)
- [BaseStore](#basestore)
- [EventBus](#eventbus)
- [Wiring to UI](#wiring-to-ui)
- [Logger](#logger)
  - [Logger Config](#logger-config)
- [Error Reporting](#error-reporting)
- [CLI](#cli)

# Install

```bash
npm i -s @ucd-lib/cork-app-utils 
```

# Overview

![workflow](./cork-app-utils-workflow.png)

# BaseModel

The BaseModel exposes the event bus and has helper methods
for registering with the global model registry.  This global object
is used by Element interface mixins to inject the models into
elements.

### Attributes

 - eventBus : EventBus

### Methods

 - register(name: String)
   - Register the model
 - emit(event: String, payload: Object)
   - Emit event to event bus

### Example Usage

```javascript
import {BaseModel} from '@ucd-lib/cork-app-utils';
import ExampleStore from '../stores/ExampleStore';
import ExampleService from '../service/ExampleService');

class ExampleModel extends BaseModel {

  constructor() {
    super();

    this.store = ExampleStore;
    this.service = ExampleService;

    this.register('ExampleModel');

    // If you want to add other models
    // this.inject('AnotherModel');
    // Make sure in your main index.js file to call
    // import {Registry} from '@ucd-lib/cork-app-utils';
    // // import models
    // Registry.ready();
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
    // get current state
    let state = this.store.get(id);

    // wait for the service to do it's thing
    // if you are interested in the loading events
    // you will want to set event listeners
    try {

      // check to see if we are already loading this resource
      if( state.state === 'loading' ) {
        // make sure you store the request promise in the store as 'request'
        // then you can await here on it as a semaphore, preventing duplicate 
        // requests if multiple UI elements request a resource at the same time
        await state.request;
      } else {
        // the return from the service is the network respons
        // not the state response which is stored in the store
        await this.service.get(id);
      }

    } catch(e) {
      // handle network error here if you want to handle in model
      // but error state should be capture by store and UI elements 
      // should react to the error state event
    }

    // regardless of the network success/failure of request above
    // return the current state
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

const exampleModel = new ExampleModel();
export default exampleModel;
```

## Loading Models

Here is a sample `index.js` file for the `./src` folder.  Where `./src` contains `./src/models`, `./src/services`, `./src/stores`, etc.

index.js:
```js
import {Registry} from '@ucd-lib/cork-app-utils';

import ExampleModel from './models/ExampleModel.js';
import AnotherModel from './models/AnotherModel.js';

// This handles inject of other models into models, avoiding
// cyclical dependency issues
Registry.ready();

// then if you want to expose
// export {ExampleModel, AnotherModel};
// or
// if( typeof window !== 'undefined' ) {
//   window.APP_MODELS = {ExampleModel, AnotherModel};
// }
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
import {BaseService} from '@ucd-lib/cork-app-utils');
import ExampleStore from '../stores/ExampleStore');

class ExampleService extends BaseService {

  constructor() {
    super();

    this.store = ExampleStore;
  }

  async get(id) {
    return this.request({
      url : `/api/get/${id}`,
      // optional
      // if the state is 'loading' and another request for this object
      // comes in, both requests will wait on the same promise preventing
      // two network requests for the same object
      checkCached : () => this.store.data.byId[id],
      // request is a promise to resolves when network request finished (success or failure)
      onLoading : request => this.store.setLoading(id, request),
      onLoad : result => this.store.setLoaded(id, result.body),
      onError : e => this.store.setError(id, e)
    });
  }
}

const exampleService = new ExampleService();
export default exampleService;
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
import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class ExampleStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byId : new LruStore({name: 'by-id'})
    }

    this.events = {
      EXAMPLE_UPDATE = 'example-update'
    }
  }

  // request is the network request promise
  // always store this so we can wait on it if a second
  // entity requests this same resource
  setLoading(id, request) {
    this._setState({
      state: this.STATE.LOADING, 
      id, request
    });
  }

  setLoaded(id, payload) {
    this._setState({
      state: this.STATE.LOADED,   
      id, payload
    });
  }

  setError(id, error) {
    this._setState({
      state: this.STATE.ERROR,   
      id, error
    });
  }

  _setState(id, state) {
    // optionally check that state has actually changed
    // this is helpful to prevent multiple events of same state that sometimes occur
    // if( !this.stateChanged(this.data.byId[id], state) ) return;

    this.data.byId[id] = state
    this.emit(this.events.EXAMPLE_UPDATE, state);
  }
}

const exampleStore = ExampleStore();
export default exampleStore;
```

# LruStore

The LruStore is a simple LRU cache store.  It can used in the BaseStore example above.  It is a simple key value store with a max size.  When the max size is reached, the least recently used key is removed.  The timestamp of a key is updated when the key is set or accessed.

## LruStore Config

```js
{
  // name of the store.  This is used when logging.
  name : String,

  // max number of items to store.  defaults to 50
  maxSize : Number
}
```

## LruStore Methods

 - get(key: String)
   - Get value for key
 - set(key: String, value: Any)
   - Set value for key


# EventBus

Global instance of EventEmitter class.


# Wiring to UI

## LitElement

```js
import { LitElement } from 'lit-element';
import render from "./my-element.tpl.js"
import {Mixin, LitCorkUtils} from "@ucd-lib/cork-app-utils";

export default class MyElement extends Mixin(LitElement)
  .with(LitCorkUtils) {

  constructor() {
    super();
    this.render = render.bind(this);

    // if you want a custom logger name call this in the constructor
    // this._initLogger('foo');
    // this.logger is always available and defaults to the element name

    // inject the ExampleModel.  Will be available at this.ExampleModel
    this._injectModel('ExampleModel');
  }

  showData(id) {
    let data = await this.ExampleModel.get('someId');
    // you can do stuff with
  }

  // LitCorkUtils will automatically wire up this method
  // to the example-update event.
  _onExampleUpdate(e) {
    if( e.state === 'loading' ) {

    } else if( e.state === 'loaded' ) {

    } else if( e.state === 'error' ) {

    }
  }

  _setExample() {
    this.ExampleModel.set({
      my : 'new state'
    });
  }
}

customElements.define('my-element', MyElement);
```

# Logger

By default all elements using `LitCorkUtils` will have access to a logger.  The logger provides methods for different log levels; `debug`, `info`, `warn` and `error`.

Setting up the logger.  The logger library provides two functions `getLogger` and `setLoggerConfig`.  `getLogger(name)` takes a name argument and returns to logger with that name.  If not logger exists by that name, a new one is created.  `setLoggerConfig` sets
the default config for all loggers.

## Logger Config

The loggers config can have the following properties:

```js
{
  // default log level for all loggers.  If not provided, they 
  // will default to 'info'.
  logLevel : String, 

  // individual logger log level override.  
  // ex: to override logger 'example' to 'debug', set :
  // config.logLevels.example = 'debug';
  logLevels : Object,

  // report errors (both uncaught exceptions on the window and logger.error calls) to a provided url endpoint.
  reportErrors : {
    // must be set to true to report
    enabled : Boolean,

    // urls to call
    url : String,

    // HTTP Method to use.  Defaults to POST
    method : String,

    // key to send as `x-api-key` header
    key : String,

    // custom headers to send in request
    headers : {},

    // custom attributes to send in request body
    customAttributes : {}
  }
}
```

There are a couple ways to setup the config.  

  - Manually call `import {setLoggerConfig} from '@ucd-lib/cork-app-utils`.  Then call `setLoggerConfig(config)`;
  - Set `window.LOGGER_CONFIG_VAR` and then make sure your config is located at `window[window.LOGGER_CONFIG_VAR]`.
  - Set `window.APP_CONFIG.logger`.

You can update the logLevels at runtime by opening the developer console and setting the `window.logLevels` object.  Example: `window.logLevels.example = 'debug'`.  Alternatively, you can set the `?loglevels=` query param in the URL to override log levels from page load.  Example: `?loglevels=example:debug,my-element:info`.;



# Error Reporting


The logger can report; uncaught errors, unhandled promises and logger.error() method calls by setting `reportErrors.enabled` to `true` and provided a `url` to post to.  For more information about a client error reporting service see: https://github.com/ucd-library/client-error-reporter.

By default, the error reporter will POST to the provided url with the following headers and body:

headers:
```
Content-Type: application/json
x-api-key: [key provided in config]
```

body:
```js
{
  // logger name
  name : 'String',

  // error object if uncaught error/promise, or arguments array if call to logger.error(). 
  error : 'Object|Array',

  // current window.location.pathname
  pathname : 'String'

  // current window.location.search (query params as string)
  search : 'String'
}
```


# CLI

Install cork-app-utils globally

```bash
npm i -g @ucd-lib/cork-app-utils 
```

The command line utility has two main helpers:

## Model Template

In the src or lib directory or your client code, run:

```
cork-app-utils model example
```

It will create the following files (and folders if they do not exist):

 - lib/models/ExampleModel.js
 - lib/services/ExampleService.js
 - lib/stores/ExampleStore.js

With boiler plate wiring code already in place.

## Lit Element Template

In the directory you wish to create a new element run:

```
cork-app-utils lit my-element
```

This will create the following files:

 - my-element.js
 - my-element.tpl.js

Where the .js file contains the main element definition and .tpl.js contains the template tag.  There is nothing specific to cork-app-utils in the Lit template other than the way we like to split the elements into two files.  To bind a Lit Element to a stores events, see the Lit Element section in [Wiring to UI](#wiring-to-ui).