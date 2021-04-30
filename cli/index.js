import createLitElement from './createLitElement.js';
import createModel from './createModel.js';

if( process.argv.length < 4 ) {
  console.log('Usage: cork-app-utils [lit|model] [name]');
  process.exit();
}

let action = process.argv[2];
let name = process.argv[3];

(async function() {
  if( action === 'lit' || action === 'element' ) {
    await createLitElement(name);
    console.log('Created lit-element '+name);
  } else if( action === 'model' ) {
    await createModel(name);
    console.log('Created model '+name);
  } else {
    console.error('Unknown Action: '+action);
  }
})();

