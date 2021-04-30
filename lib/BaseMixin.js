class BaseMixin {
  ready() {
    // set listening to true
    this.listening = true;
  }
}

// Set global if available
if( typeof window !== 'undefined' ) { 
  window.BaseMixin = BaseMixin;
}

export default BaseMixin;