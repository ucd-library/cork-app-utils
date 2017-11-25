const path = require('path');
const fs = require('fs-extra');
const tplDir = path.join(__dirname, 'templates');

const defs = [
  {
    toDir : path.join('elements', 'interfaces'),
    type : 'interface'
  },
  {
    toDir : path.join('lib', 'models'),
    type : 'model'
  },
  {
    toDir : path.join('lib', 'services'),
    type : 'service'
  },
  {
    toDir : path.join('lib', 'stores'),
    type : 'store'
  },
]

module.exports = async function(name, dir) {
  if( !dir ) {
    dir = process.cwd();
  }

  name = toCapCase(name);

  for( var i = 0; i < defs.length; i++ ) {
    await mkFile(name, dir, defs[i]);
  }
}

async function mkFile(name, dir, def) {
  let toDir = path.join(dir, def.toDir);
  await fs.mkdirs(toDir);

  let jsTypeName = def.type;
  jsTypeName = toCapCase(jsTypeName);
console.log(jsTypeName);

  let toFile = path.join(toDir, name+jsTypeName+'.js');
  console.log(toFile);

  let template = await fs.readFile(path.join(tplDir, def.type+'.tpl'), 'utf-8')
  template = template.replace(/{{name}}/g, name);

  await fs.writeFile(toFile, template);
}

function toCapCase(name) {
  return name[0].toUpperCase() + name.substr(1, name.length);
}