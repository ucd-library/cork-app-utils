const EventBus = require('./EventBus');
const Registry = require('./Registry');

/**
 * @mixin LitCorkUtils
 * @description This is the base mixin to use for any element that wants to 
 * bind to a model, it's events and the models store events.  All interface
 * mixins that wrap models will assume this class has been mixed into the 
 * element class using:
 * 
 * class MyElement extends Mixin(LitElement)
 *                 .with(LitCorkUtils) {
 *  // do stuff
 * }
 * 
 */
const LitCorkUtils = subclass =>
  class EventMixin extends subclass {

    static get properties() {
      return {
        /**
         * @property listening
         * @description The listening flag toggles if this element to fire
         * off event listeners.  When false, no event handling methods 
         * will fire.  Set to true (default) when you want this element to react 
         * to events
         * 
         * This flag wires in really well with iron-pages.  Allowing you
         * to toggle the attribute.  Just set selected-attribute="listening".
         */
        listening : {
          type : Boolean
        }
      }
    }
    
    /**
     * @property bind
     * @description Merge value with current bind object.  The bind
     * object is a set of key/value pairs where the key is the event
     * to listen for and the value is the element method name to call
     * when the event is triggered.
     */
    set bind(value) {
      this._bind = Object.assign(this.bind, value)
    }

    get bind() {
      if( !this._bind ) this._bind = {};
      return this._bind;
    }
    
    constructor() {
      super();

      // initialize handlers
      this.bind = {};
      
      // actual function called by handler
      this._eb_handlers = {};

      // have we initialized the handlers?
      this._eb_handlersSet = false;
      
      // do we want to detach listeners when element is detached
      // (prevent memory leaks)
      this._eb_unregisterOnDetach = true;

      this._debounce_handlers = {};

      this.listening = true;
    }
    
    connectedCallback() {
      super.connectedCallback();
      this._eb_init();
    }
    
    /**
     * @method _eb_init
     * @private
     * 
     * @description loops they key/value pairs in this.bind and sets
     * the event listener and method to fire using this._eb_init_fn().
     * If a method does not exist on this element and console warning 
     * is fired.
     */
    _eb_init() {
      if( this._eb_handlersSet ) return;
      this._eb_handlersSet = true;

      if( this._debugLitCorkUtils ) {
        console.log(this.nodeName, 'ready and connected to DOM, attaching event listeners', this.bind);
      }
      
      for( var key in this.bind ) {
        if( !this[this.bind[key]] ) {
          console.warn(`${this.nodeName} could not bind event ${key} to ${this.bind[key]}`);
          continue;
        }
        this._eb_init_fn(key);
      }
    }
    
    /**
     * @method _eb_init_fn
     * @private
     * @description Given a this.bind key (event name), bind to 
     * the event bus this elements method.
     * 
     * @param {String} eventName event name 
     */
    _eb_init_fn(eventName) {
      this[this.bind[eventName]] = this[this.bind[eventName]].bind(this);

      this._eb_handlers[eventName] = (...args) => {
        // if we are not listening, quit
        if( !this.listening ) {
          if( this._debugLitCorkUtils ) {
            console.warn(this.nodeName, 'ignoring', eventName, 'event, element not listening');
          }
          return;
        }

        if( this._debugLitCorkUtils ) {
          console.log(this.nodeName, 'received event', eventName, ', triggering function:', this.bind[eventName]);
        }
        this[this.bind[eventName]].apply(this, args);
      }

      // actually wire up event 
      EventBus.on(eventName, this._eb_handlers[eventName]);
    }
    
    /**
     * @method
     * @description when this element is disconnected from the DOM,
     * remove the event listener to prevent memory leaks.
     */
    disconnectedCallback() {
      super.disconnectedCallback();

      if( this._debugLitCorkUtils ) {
        console.log(this.nodeName, 'disconnected from DOM, removing event listeners');
      }
      
      if( !this._eb_unregisterOnDetach ) return;
      if( !this._eb_handlersSet ) return;

      this._eb_handlersSet = false;
      
      for( var key in this.bind ) {
        if( !this[this.bind[key]] ) continue;
        
        // do a little verification that listener was actually detached
        let count = EventBus.listenerCount(key);

        EventBus.removeListener(key, this._eb_handlers[key]);

        if( EventBus.listenerCount(key) !== count-1 ) {
          console.warn(this.nodeName, 'On element detach, failed to remove event listener for: ', key);
        }

        if( this._debugLitCorkUtils ) {
          console.log(this.nodeName, 'removing event listener for:', key);
        }
      }
    }
    
    /**
     * @property EventBus
     * @description return reference to the global event bus.
     * Proly shouldn't really need to access this, but here just in case.
     */
    EventBus() {
      return EventBus;
    }
    
    /**
     * @method _injectModel
     * @description Add model reference to this element and register the
     * Models and Model Stores events for any method that matches the event name.
     * 
     * This should be called by mixin interface classes to inject their parent Model
     * into the element for access to model methods.  The model name should be the
     * same name the model used to register itself with the Registry.  This name 
     * will also be used to set a reference on the element.
     * 
     * Example: this._injectModel('MyModel') will set this.MyModel.
     * 
     * Events will be automatically wired up that have associated method handers.  The
     * method name should be called as follows:
     * 
     * Assuming a event name of: my-cool-event
     * 
     * To listen to my-cool-event you should define a method on this element called:
     * _onMyCoolEvent(e) {
     *   // do stuff
     * }
     * 
     * Note, the above method will only fire when this.listening = true.
     * 
     * @param {String} names Model name to inject and bind to events 
     */
    _injectModel(...names) {
      names.forEach(name => {
        if( typeof name === 'string' ) this._injectModelStr(name);
        else this._bindModelObj(name);
      });
    }

    _injectModelStr(name) {
      this[name] = Registry.getModel(name);
      this._bindModelObj(this[name]);
    }

    _bindModelObj(model) {
      // wire up any events from injected model
      if( model.events ) {
        this._registerModelEvents(model.events);
      }

      // wire up any events from injected models store
      if( model.store && model.store.events ) {
        this._registerModelEvents(model.store.events);
      }
    }
    
    /**
     * @method _registerModelEvents
     * @private
     * @description called by _injectModel.  Adds event names to this.bind for any
     * event that has a associated method defined in the class.
     * 
     * @param {Object} events the key/value hash of events defined by a Model 
     * or a store
     */
    _registerModelEvents(events) {
      for( var key in events ) {
        var methodName = this._getMethodNameFromEvent(events[key]);
        
        // class did not define and event handler
        if( !this[methodName] ) {
          if( this._debugLitCorkUtils ) {
            console.log(this.nodeName, 'auto-bind:', methodName+' -> '+events[key], false);
          }
          continue;
        }

        if( this._debugLitCorkUtils ) {
          console.log(this.nodeName, 'auto-bind:', methodName+' -> '+events[key], true);
        }
        this.bind[events[key]] = methodName;
      }
    }
    
    /**
     * @method _getMethodNameFromEvent
     * @private
     * @description given a event name, ex: 'my-cool-event' return the method
     * name that needs to exist to register the event handler, ex: _onMyCoolEvent.
     * 
     * @param {String} eventName event name
     */
    _getMethodNameFromEvent(eventName) {
      return '_on' + eventName
                      .split('-')
                      .map((part) => {
                        return part.charAt(0).toUpperCase() + part.slice(1)
                      })
                      .join('');
    
    }
    
    /**
     * @method emit
     * @description Fire a custom event on the event bus.
     * 
     * @param {String} event name of event to fire
     * @param {Object} payload payload of event
     */
    emit(event, payload) {
      EventBus.emit(event, payload);
    }
    
    /**
     * @method fire
     * @description Adding polymer 1.0 helper back in.  Fire a custom 
     * dom event.
     * 
     * @param {String} event name of event to fire
     * @param {Object} payload payload of event
     */
    fire(event, payload = {}) {
      this.dispatchEvent(
        new CustomEvent(
          event, 
          {
            detail: payload,
            bubbles: true, 
            composed: true
          }
        )
      );
    }

    byId(id) {
      if( this.shadowRoot ) return this.shadowRoot.getElementById('#'+id);
      return this.getElementById('#'+id);
    }

    updated(changedProperties) {
      if( changedProperties.has('listening') ) this._onListenUpdate();
    }
    
    /**
     * @method _onListenUpdate
     * @description fires when element is either activated and listening to events or
     * deactivated and no longer listening to events.
     * 
     * Default functionality is to do nothing.
     */
    _onListenUpdate() {
      // implement me
    }
    
  }

if( typeof window !== 'undefined' ) {
  window.LitCorkUtils = LitCorkUtils;
}

module.exports = LitCorkUtils;