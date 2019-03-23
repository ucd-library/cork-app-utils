const path = require('path');
const fs = require('fs-extra');

module.exports = async function(dashName, dir) {
  if( !dir ) {
    dir = process.cwd();
  }

  let htmlPath = path.join(dir, dashName+'.tpl.js');
  let jsPath = path.join(dir, dashName+'.js');
  let camelName = toCamel(dashName);

  let htmlTemplate = await fs.readFile(path.join(__dirname, 'templates', 'lit-html.tpl'), 'utf-8');
  await fs.writeFile(htmlPath, htmlTemplate);

  let jsTemplate = await fs.readFile(path.join(__dirname, 'templates', 'lit-js.tpl'), 'utf-8');

  
  jsTemplate = jsTemplate
                .replace(/{{dashname}}/g, dashName)
                .replace(/{{camelname}}/g, camelName)

  await fs.writeFile(jsPath, jsTemplate);
}

function toCamel(name) {
  let camel = name[0].toUpperCase();
  

  for( var i = 1; i < name.length; i++ ) {
    if( name[i] === '-' ) {
      i++;
      if( i < name.length ) camel += name[i].toUpperCase();
      continue;
    }
    camel += name[i];
  }

  return camel
}