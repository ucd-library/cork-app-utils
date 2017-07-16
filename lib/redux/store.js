/**
 * Wire up our redux store with middleware, reducers and observers.
 */
var store = null;
var redux = require('redux');
var observe = require('redux-observers').observe;

function init(config) {
  if( config.middleware ) {
    var middleware = redux.applyMiddleware.apply(redux, config.middleware);
    store = redux.createStore(config.reducers, middleware);
  } else {
    store = redux.createStore(config.reducers);
  }

  if( config.observers ) {
    setTimeout(() => {
      observe(store, config.observers);
    });
  } 
}

module.exports = (config) => {
  if( !store ) init(config); 
  return store;
};