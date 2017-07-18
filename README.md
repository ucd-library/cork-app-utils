# BaseModel

The BaseModel exposes the ReduxStore and EventBus to classes as well as adds helper methods for access redux state, emiting events and listening for events from the event bus.

### Attributes

 - store : ReduxStore
 - eventBus : EventBus

### Methods

 - bindMethods()
   - create listeners on event bus.  events names will be [Classname].[methodname]
 - emit(event: String, payload: Object)
   - Emit event to event bus
 - dispatch(action: Object)
   - Dispatch action to ReduxStore
 - getState()
   - Shortcut for access ReduxStore state

### Example Usage

```javascript
var BaseModel = require('cork-app-utils').BaseModel;
var actions = require('../redux/actions/example');

class ExampleModel extends BaseModel {

  constructor() {
    super();

    // adds listeners for events 'ExampleModel.get' and 'ExampleModel.set'
    // to the eventBus.
    this.bindMethods();
  }

  /**
   * Get the current redux state
   *
   * @returns {Object} example state
   */
  get() {
    return this.getState().example;
  }

  /**
   * Update the example state
   *
   * @returns {Object} update - keys to be updated
   */
  set(update) {
    this.dispatch(
      actions.updateState(update)
    )

    return this.getState().appState;
  }
}

module.exports = new ExampleModel();
```
# EventBus

Global instance of EventEmitter class.

# Wiring to UI

This example will use Polymer and the [cork-common-utils](https://github.com/cork-elements/cork-common-utils) elements
to create a mixin class (interface) that can be added to multiple elements.

## Mixin Class Creation

```html
<script>
  const ExampleMixin = subclass => 

  class ExampleController extends subclass {

      // we will go over this below, this will listen to events from redux-observer
      get bind() {
        return Object.assign(
          super.bind,
          {
            'example-update' : '_onExampleUpdate'
          }
        );
      }

      _setExample(state) {
        return this.emit('ExampleModel.set', state);
      }

      _getExample() {
        return this.emit('ExampleModel.get');
      }

      _onExampleUpdate(e) {
        // implement me
      }
  }
</script>
```

## Using mixin with Polymer 2.0 element

```html
<dom-module id="my-element">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <div>[[exampleStateStr]]</div>
    
  </template>
  <script>
    // cork-common-utils has elements for 'Mixin' and 'EventMixin'
    class MyElement extends 
      Mixin(Polymer.Element)
      .with(EventMixin, ExampleMixin) {

      static get is(){ return 'my-element' }

      static get properties() {
        return {
            exampleStateStr : {
              type : String,
              value : ''
            }
          }
      }

      ready() {
        this._getExample().then(state => this._onExampleUpdate(state));
      }

      _onExampleUpdate(exampleState) {
        this.exampleStateStr = JSON.stringify(exampleState);
      }

      _setExample() {
        super._setExample({
          my : 'new state'
        });
      }
    }
    window.customElements.define(MyElement.is, MyElement);
  </script>
</dom-module>
```

## Using redux-observers to fire events

Create a event emitter.  Not required, but it's nice to have all these events defined somewhere

```js
var EventBus = require('cork-app-utils').EventBus;

class ObserverEventEmitter {

  static onExampleChange(state) {
    EventBus.emit('example-update', state);
  }
}

module.exports = ObserverEventEmitter;
```

Create an observer

```js
var observer = require('cork-app-utils').ReduxObserver;
var ObserverEventEmitter = require('./ObserverEventEmitter');

var example = observer(
  (state) => state.example,
  (dispatch, current, previous) => {
    ObserverEventEmitter.onExampleChange(current);
  }
);

module.exports = [example];
```

Finally, wire up redux

```js
var store = require('cork-app-utils').ReduxStore;
// should be return value of combineReducers, you can access via 
// var combineReducers = require('cork-app-utils').ReduxCombineReducers
var reducers = require('./redux/reducers');
// should be an array of observers
var observers = require('./redux/observers');
// should be an array of middleware
var middleware = require('./redux/middleware');

// initialize redux store
// all Models extending the BaseModel have access to this store.
store({reducers, observers, middleware});
```
