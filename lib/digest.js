let encoder;
let warnedNoCrypto = false;

/**
 * @method digest
 * @description Generate a hex digest of a message (text or object) using a specified algorithm.
 * If the message is an object, it will be converted to a string using JSON.stringify.
 * 
 * Algorithm options: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#algorithm
 * 
 * @param {String|Object} message - The message to digest.
 * @param {Object} opts - Options for the digest.
 * @param {String} opts.algo - The algorithm to use for the digest. Default is SHA-256.
 * 
 * @returns {Promise<String>} The hex digest of the message.
 **/ 
async function digest(message, opts={}) {
  if( typeof message !== 'string' ) {
    message = JSON.stringify(message);
  }

  if( !window.crypto.subtle ) {
    if( !warnedNoCrypto ) {
      console.warn('window.crypto.subtle not available, using simple hash function');
      warnedNoCrypto = true;
    }
    return simpleHash(message);
  }

  const algo = opts.algo || 'SHA-256';  
  if( !encoder ) encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await window.crypto.subtle.digest(algo, data);
  const bytes = new Uint8Array( hash );
  return uint8ToHexStr( bytes );
}

function uint8ToHexStr(uint8) {
  return '0x'+Array.from(uint8)
    .map((i) => i.toString(16).padStart(2, '0'))
    .join('');
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Simple hash using prime multiplier
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff; 
  }
  return (hash >>> 0).toString();
}

export default digest;