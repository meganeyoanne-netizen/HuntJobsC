const fs=require("fs"),path=require("path"),parser=require("./.ui-tools/node_modules/@babel/parser"),traverse=require("./.ui-tools/node_modules/@babel/traverse").default;
const files=JSON.parse(fs.readFileSync("ui-modified.json","utf8")).filter(f=>/pages[\\/](admin|candidat|recruteur)/.test(f));
for(const file of files){let s=fs.readFileSync(file,"utf8");let ast=parser.parse(s,{sourceType:"module",plugins:["jsx"]}),edits=[];
traverse(ast,{JSXElement(p){const n=p.node,attr=n.openingElement.attributes.find(a=>a.name?.name==="className"),cls=attr?s.slice(attr.start,attr.end):"";const fn=p.findParent(x=>x.isFunctionDeclaration());if(fn?.node.id?.name.endsWith("Page")&&n.openingElement.name.name==="div"&&/sticky top-0/.test(cls)&&/lg:hidden/.test(cls)){edits.push([n.start,n.end,p.parentPath.isJSXElement()?"":"null"]);p.skip();}},
CallExpression(p){if(p.node.callee.name==="useEffect"&&/setTimeout/.test(s.slice(p.node.start,p.node.end))&&/setLoading\(false\)/.test(s.slice(p.node.start,p.node.end))){if(p.parentPath.isExpressionStatement())edits.push([p.parentPath.node.start,p.parentPath.node.end,""]);}},
VariableDeclaration(p){const text=s.slice(p.node.start,p.node.end);if(/const \[loading, setLoading\] = useState\(true\)/.test(text))edits.push([p.node.start,p.node.end,"const loading = false;"]);}});
edits.sort((a,b)=>b[0]-a[0]);for(const [a,b,v]of edits)s=s.slice(0,a)+v+s.slice(b);
for(let pass=0;pass<3;pass++){ast=parser.parse(s,{sourceType:"module",plugins:["jsx"]});edits=[];traverse(ast,{FunctionDeclaration(p){if(!p.parentPath.isProgram())return;const name=p.node.id.name;if(/Sidebar|Navbar|MobileHeader|MobileNavigation|MobileNav|Skeleton/.test(name)&&!p.scope.getBinding(name)?.referenced)edits.push([p.node.start,p.node.end,""]);}});edits.sort((a,b)=>b[0]-a[0]);for(const[a,b,v]of edits)s=s.slice(0,a)+v+s.slice(b);}
fs.writeFileSync(file,s);}
let p="src/index.css",s=fs.readFileSync(p,"utf8").replace("--hunt-navy: #0d1b3e","--hunt-navy: #071A36");fs.writeFileSync(p,s);
console.log("Removed obsolete navigation and artificial loading");
