let isBrowser = typeof window !== 'undefined';

if( isBrowser && !window._corkAppUtils ) {
  window._corkAppUtils = {};
}

function setGlobal(key, value) {
  if( !isBrowser ) return;
  window._corkAppUtils[key] = value;
}

function getGlobal(key) {
  if( !isBrowser ) return null;
  return window._corkAppUtils[key];
}

export {
  setGlobal,
  getGlobal
}