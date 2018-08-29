const createElement = require('./createElement');
const createModel = require('./createModel');

if( process.argv.length < 4 ) {
  return console.log('Usage: cork-app-utils [element|model] [name]');
}

let action = process.argv[2];
let name = process.argv[3];

(async function() {
  if( action === 'element' ) {
    await createElement(name);
    console.log('Created element '+name);
  } else if( action === 'model' ) {
    await createModel(name);
    console.log('Created model '+name);
  } else {
    console.error('Unknown Action: '+action);
  }
})();

