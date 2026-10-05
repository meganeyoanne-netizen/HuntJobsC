const fs=require("fs");
fs.appendFileSync("src/design-system.css",`
.shell-content .grid>*{min-width:0}.shell-content article{min-width:0}.shell-content [class*="inline-flex"]{flex-wrap:wrap}.shell-content [class*="text-xs"][class*="tracking-"]{letter-spacing:.08em}
@media(max-width:639px){.shell-content .grid:not([class*="grid-cols-"]){grid-template-columns:minmax(0,1fr)}.shell-content .grid:has(>.ui-stat){grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.shell-content main>div[class*="px-5"]{padding-left:0;padding-right:0}.shell-content .ui-stat{padding:16px}.shell-content .ui-stat small{font-size:11px}}
`);
let p="src/pages/candidat/CandidateDashboardPage.jsx",s=fs.readFileSync(p,"utf8");s=s.replace('Profil complété à 78 %','Profil complété à {stats.profil_completion || 0} %').replace('style={{ width: "78%" }}','style={{ width: (stats.profil_completion || 0) + "%" }}').replace('3/5 sessions','Préparation personnalisée').replace('style={{ width: "60%" }}','style={{ width: "100%" }}');s=s.replace('wrapper: "border-red-100 bg-red-50",\n    icon: "bg-red-100 text-red-600",\n    text: "text-red-700",','wrapper: "border-slate-100 bg-slate-50",\n    icon: "bg-slate-100 text-slate-600",\n    text: "text-slate-700",');fs.writeFileSync(p,s);
console.log("Responsive grid containment and real profile completion fixed");
