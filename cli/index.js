const createElement = require('./createElement');
const createModel = require('./createModel');

let action = process.argv[2];
let name = process.argv[3];

(async function() {
  if( action === 'element' ) {
    await createElement(name);
    console.log('Created element '+name);
  } else if( action = 'model' ) {
    await createModel(name);
    console.log('Created model '+name);
  } else {
    console.error('unknownAction');
  }
})();

