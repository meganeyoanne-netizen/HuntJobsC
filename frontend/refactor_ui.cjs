const fs = require("fs"), path = require("path");
const parser = require("./.ui-tools/node_modules/@babel/parser"), traverse = require("./.ui-tools/node_modules/@babel/traverse").default;
const root = "src"; const files = []; function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, entry.name); if (entry.isDirectory()) walk(p); else if (/\.jsx$/.test(p)) files.push(p); } } walk(root);
const navNames = new Set(["AdminSidebar", "AdminNavbar", "AdminMobileNav", "MobileHeader", "MobileNavigation", "CandidateSidebar"]);
const changed = [];
for (const file of files) {
    if (file.includes("components/ui") || file.includes("components/layout")) continue;
    let source = fs.readFileSync(file, "utf8"); const business = /pages[\\/](admin|candidat|recruteur)[\\/]/.test(file); const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] }); const edits = []; const imports = new Set();
    traverse(ast, {
        JSXElement(p) {
            const n = p.node, name = n.openingElement.name.name; const attr = n.openingElement.attributes.find(a => a.name?.name === "className"); const cls = attr ? source.slice(attr.start, attr.end) : "";
            const fn = p.findParent(x => x.isFunctionDeclaration()); const main = fn?.node.id?.name.endsWith("Page");
            if (business && main && ((name === "aside" && /fixed/.test(cls)) || (name === "header" && /sticky/.test(cls)) || navNames.has(name) || (name === "nav" && /fixed/.test(cls)) || (name === "div" && /fixed bottom-0/.test(cls)))) {
                const jsxParent = p.parentPath.isJSXElement() || p.parentPath.isJSXFragment(); edits.push([n.start, n.end, jsxParent ? "" : "null"]); p.skip(); return;
            }
            const mapping = { button: "Button", form: "Form", input: "Input", textarea: "Textarea", select: "Select" }; const replacement = mapping[name]; if (replacement) { imports.add(replacement); edits.push([n.openingElement.name.start, n.openingElement.name.end, replacement]); if (n.closingElement) edits.push([n.closingElement.name.start, n.closingElement.name.end, replacement]); }
            if (business && name === "div" && /fixed inset-0/.test(cls) && !cls.includes("bg-black/") && !cls.includes("bg-slate-900/") && !cls.includes("bg-[#071")) { const owner = p.findParent(x => x.isFunctionDeclaration()); const close = owner?.node.params[0]?.properties?.find(v => v.key?.name === "onClose"); if (close) { imports.add("ModalFrame"); edits.push([n.openingElement.name.start, n.openingElement.name.end, "ModalFrame"]); if (n.closingElement) edits.push([n.closingElement.name.start, n.closingElement.name.end, "ModalFrame"]); edits.push([n.openingElement.name.end, n.openingElement.name.end, " onClose={onClose}"]); } }
        }, StringLiteral(p) { if (p.parentPath.isJSXAttribute() && p.parentPath.node.name.name === "className") { let value = p.node.value.replace(/(?:[a-z]+:)?text-\[(?:[0-9]|1[01])px\]/g, "text-xs").replace(/lg:(?:pl|ml)-\[(?:260|270)px\]/g, "").replace(/#(?:0d1b3e|0D1B3E|071a36|071A36)/g, "#071A36"); if (value !== p.node.value) edits.push([p.node.start, p.node.end, JSON.stringify(value)]); } }
    });
    edits.sort((a, b) => b[0] - a[0]); for (const [start, end, value] of edits) source = source.slice(0, start) + value + source.slice(end);
    if (imports.size) { let relative = path.relative(path.dirname(file), "src/components/ui").replace(/\\/g, "/"); if (!relative.startsWith(".")) relative = "./" + relative; source = 'import { ' + [...imports].join(", ") + ' } from "' + relative + '";\n' + source; }
    if (edits.length) { fs.writeFileSync(file, source); changed.push(file); }
}
fs.copyFileSync(".ui-tools/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "src/assets/fonts/inter-latin.woff2");
let app = fs.readFileSync("src/App.jsx", "utf8").replace('useEffect, useState', 'useEffect, useState, lazy, Suspense');
app = app.replace(/import (\w+Page) from "(\.\/pages\/[^"]+)";/g, (_, name, p) => 'const ' + name + ' = lazy(() => import("' + p + '"));');
app = 'import AppShell from "./components/layout/AppShell";\n' + app;
app = app.replace('return <>{content}<ApiFeedback /></>;', 'return <><Suspense fallback={<LoadingPanel />}>{user && !["landing","login","register","forgot-password","reset-password"].includes(page) ? <AppShell user={user} activePage={page} onNavigate={navigate} onLogout={handleLogout}>{content}</AppShell> : content}</Suspense><ApiFeedback /></>;');
fs.writeFileSync("src/App.jsx", app); changed.push("src/App.jsx");
fs.writeFileSync("ui-modified.json", JSON.stringify(changed, null, 2)); console.log("Updated " + changed.length + " files");
