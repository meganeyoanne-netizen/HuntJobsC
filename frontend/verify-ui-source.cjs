const fs=require('node:fs');
const parser=require('./.ui-tools/node_modules/@babel/parser');
const traverse=require('./.ui-tools/node_modules/@babel/traverse').default;
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())walk(file);else if(/\.(jsx|js)$/.test(file))files.push(file);}}
walk('src');
let errors=0;
for(const file of files){const source=fs.readFileSync(file,'utf8');try{const ast=parser.parse(source,{sourceType:'module',plugins:['jsx']});traverse(ast,{ImportDeclaration(path){const name=path.node.source.value;if(name.startsWith('.')){const target=require('node:path').resolve(require('node:path').dirname(file),name);if(![target,target+'.js',target+'.jsx',target+'/index.jsx',target+'/index.js'].some(fs.existsSync)){console.log('Import introuvable: '+file+' '+name);errors++;}}}});}catch(error){console.log(file+': '+error.message);errors++;}}
console.log(`${files.length} fichiers JS/JSX analysés; ${errors} erreur(s) de syntaxe ou d’import.`);
process.exitCode=errors?1:0;
