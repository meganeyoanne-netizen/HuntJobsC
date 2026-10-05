const fs=require("fs");
let p="src/pages/auth/RegisterPage.jsx",s=fs.readFileSync(p,"utf8");s=s.replace('Textarea, Input }','Textarea, Input as NativeInput }');const start=s.indexOf("function Input(");s=s.slice(0,start)+s.slice(start).replace(/<Input\b/g,"<NativeInput").replace(/<\/Input>/g,"</NativeInput>");fs.writeFileSync(p,s);
p="src/index.css";s=fs.readFileSync(p,"utf8").replace('\n@import "./design-system.css";\n','');s=s.replace('@import "tailwindcss";','@import "tailwindcss";\n@import "./design-system.css";');fs.writeFileSync(p,s);
