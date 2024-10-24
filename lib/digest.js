let encoder;

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
  const algo = opts.algo || 'SHA-256';

  if( typeof message !== 'string' ) {
    message = JSON.stringify(message);
  }
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

export default digest;