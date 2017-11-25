const path = require('path');
const fs = require('fs-extra');

module.exports = async function(dashName, dir) {
  if( !dir ) {
    dir = process.cwd();
  }

  let htmlPath = path.join(dir, dashName+'.html');
  let jsPath = path.join(dir, dashName+'.js');

  await fs.writeFile(htmlPath, '');
  let template = await fs.readFile(path.join(__dirname, 'templates', 'element.tpl'), 'utf-8');

  let camelName = toCamel(dashName);
  template = template
                .replace(/{{dashname}}/g, dashName)
                .replace(/{{camelname}}/g, camelName)

  await fs.writeFile(jsPath, template);
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