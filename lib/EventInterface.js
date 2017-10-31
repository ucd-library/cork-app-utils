const MasterController = require('./MasterController');

const EventInterface = subclass =>
  class EventMixin extends subclass {

    static get properties() {
      return {
        active : {
          type : Boolean,
          value : false,
          observer : '_onActive'
        }
      }
    }
    
    set bind(value) {
      this._bind = Object.assign(this.bind, value)
    }

    get bind() {
      if( !this._bind ) this._bind = {};
      return this._bind;
    }
    
    constructor() {
      super();
      this.bind = {};
      // have we initialized the handlers?
      this._eb_handlersSet = false;
      // do we want to detach listeners when element is detached
      // (prevent memory leaks)
      this._eb_unregisterOnDetach = true;
    }
    
    ready() {
      super.ready();
      this._eb_init();
    }
    
    connectedCallback() {
      super.connectedCallback();
      this._eb_init();
    }
    
    _eb_init() {
      if( this._eb_handlersSet ) return;
      this._eb_handlersSet = true;
      
      for( var key in this.bind ) {
        if( !this[this.bind[key]] ) {
          console.warn(`${this.nodeName} could not bind event ${key} to ${this.bind[key]}`);
          continue;
        }
        this._eb_init_fn(key);
      }
    }
    
    _eb_init_fn(key) {
      this[this.bind[key]] = this[this.bind[key]].bind(this);
      MasterController.on(key, function() {
        this[this.bind[key]].apply(this, arguments);
      }.bind(this));
    }
      
    disconnectedCallback() {
      super.disconnectedCallback();
      
      if( !this._eb_unregisterOnDetach ) return;
      if( !this._eb_handlersSet ) return;

      this._eb_handlersSet = false;
      
      for( var key in this.bind ) {
        if( !this[this.bind[key]] ) continue;
        MasterController.removeListener(key, this[this.bind[key]]);
      }
    }
    
    MasterController() {
      return MasterController;
    }
    
    _injectModel(name) {
      this[name] = MasterController.getModel(name);

      // wire up any events from injected model
      if( this[name].events ) {
        this._registerModelEvents(this[name].events);
      }

      // wire up any events from injected models store
      if( this[name].store && this[name].store.events ) {
        this._registerModelEvents(this[name].store.events);
      }
    }
    
    _registerModelEvents(events) {
      for( var key in events ) {
        var methodName = this._getMethodNameFromEvent(events[key]);
        // class did not define and event handler
        if( !this[methodName] ) continue;
        this.bind[events[key]] = methodName;
      }
    }
    
    _getMethodNameFromEvent(eventName) {
      return '_on' + eventName
                      .split('-')
                      .map((part) => {
                        return part.charAt(0).toUpperCase() + part.slice(1)
                      })
                      .join('');
    
    }
    
    emit() {
      return MasterController
                  .emit
                  .apply(this.getEventBus(), arguments);
    }
    
    // adding polymer 1.0 helper back in
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

    // adding polymer 1.0 helper back in
    debounce(name, callback, timeout) {
      name = `_${name}Debouncer`;
      this[name] = Polymer.Debouncer.debounce(
        this[name],
        Polymer.Async.timeOut.after(timeout),
        callback.bind(this)
      );
    }
    
    _onActive() {
      // implement me
    }
  }

if( typeof window !== 'undefined' ) {
  window.EventMixin = EventMixin;
}

module.exports = EventMixin;