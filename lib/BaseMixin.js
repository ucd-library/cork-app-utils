class BaseMixin {
  ready() {}
}

// Set global if available
if( typeof window !== 'undefined' ) { 
  window.BaseMixin = BaseMixin;
}

module.exports = BaseMixin;