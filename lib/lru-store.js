import {getLogger} from './logger.js';

class LruStore {

  /**
   * @constructor
   * 
   * @param {Object} opts
   * @param {String} opts.name name of the store
   * @param {Number} opts.maxSize max number of items to store in cache 
   */
  constructor(opts={}) {
    if( !opts.name ) throw new Error('LruStore requires a name');
    if( !opts.maxSize ) opts.maxSize = 50;

    this.logger = getLogger('lru-store');
    
    this.name = opts.name;
    this.maxSize = opts.maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const wrapper = this.cache.get(key);
    wrapper.lastUsed = Date.now();
    return wrapper.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value, 
      lastUsed: Date.now()
    });
    this.clean();
  }

  clean() {
    if( this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this._clean();
    }, 1000);
  }

  _clean() {
    if( this.cache.size <= this.maxSize) return;

    let keyTime = [];
    this.cache.forEach((value, key) => {
      keyTime.push({key, lastUsed: value.lastUsed});
    });

    keyTime.sort((a, b) => b.lastUsed - a.lastUsed);
    let now = Date.now();

    for (let i = this.maxSize; i < keyTime.length; i++) {
      keyTime[i].lastUsed = now - keyTime[i].lastUsed
      this.logger.debug(this.name+' removing ', keyTime[i]);
    }
  }

}

export default LruStore;