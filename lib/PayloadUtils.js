
const IGNORE_PROPS = ['id', 'state', 'request', 'payload', 'error'];

class PayloadUtils {
  
  /**
   * @constructor
   * @param {Object} opts
   * @param {Array} opts.idParts - array of id parts in order. Required.
   * @param {Object} opts.customKeyFormat - object with functions to format id parts. Optional.
   * @param {String} opts.separator - separator for id parts. Default is '/'. 
   */
  constructor(opts={}) {

    this.idParts = opts.idParts;
    this.customKeyFormat = opts.customKeyFormat;
    this.separator = opts.separator || '/';
    this.asJson = opts.asJson || false;

    if( !this.idParts ) {
      throw new Error('idParts is required');
    }
  }

  /**
   * @method getKey
   * @description get key from id object
   * 
   * @param {Object} ido 
   * @returns {String}
   */
  getKey(ido) {
    let id = this.asJson ? {} : [];

    for( let prop of this.idParts ) {
      if( ido[prop] !== undefined ) {
        if( this.customKeyFormat && this.customKeyFormat[prop] ) {
          this._addKeyPart(id, prop, this.customKeyFormat[prop](ido[prop]));
        } else {
          this._addKeyPart(id, prop, ido[prop]);
        }
      }
    }

    return id.join(this.separator);
  }

  _addKeyPart(key, prop, value) {
    if( this.isJson ) {
      key[prop] = value;
    } else {
      key.push(prop+':'+value);
    }
  }

  /**
   * @method generate
   * @description generate payload object
   * 
   * @param {Object} ido - id object
   * @param {Object} args - payload properties. Should include one of; request, payload, or error.
   * @param {String} state - state of payload. Optional.  If not provided, will be determined by args (recommended).
   * 
   * @returns {Object}
   */
  generate(ido, args={}, state) {
    let id = this.getKey(ido);

    if( !state ) {
      if( args.error !== undefined ) state = 'ERROR';
      else if( args.request !== undefined ) state = 'LOADING';
      else if( args.payload !== undefined ) state = 'LOADED';
      else throw new Error('No state provided');
    }

    let payload = {
      id,
      state,
      request: args.request,
      payload: args.payload,
      error: args.error
    };

    for( let prop in ido ) {
      if( IGNORE_PROPS.indexOf(prop) > -1 ) continue;
      if( payload[prop] === undefined ) {
        payload[prop] = ido[prop];
      }
    }

    return payload;
  }
}

export default PayloadUtils;