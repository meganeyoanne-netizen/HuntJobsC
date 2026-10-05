import React, { useId } from "react";

export default function FormField({ label, description, required, children, value, onChange, placeholder, type = "text", icon, disabled = false, error, className = "" }) {
  const id = useId();
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  let firstControl;
  let controlIndex = 0;
  function associate(nodes) {
    return React.Children.map(nodes, node => {
      if (!React.isValidElement(node)) return node;
      const kind = typeof node.type === "string" ? node.type : node.type?.name;
      if (["input", "select", "textarea", "Input", "Select", "Textarea"].includes(kind)) {
        const controlId = node.props.id || `${id}-control-${controlIndex++}`;
        if (!firstControl) firstControl = controlId;
        return React.cloneElement(node, {
          id: controlId,
          "aria-labelledby": node.props["aria-labelledby"] || (node.props["aria-label"] ? undefined : labelId),
          "aria-describedby": [node.props["aria-describedby"], (description || error) && helpId].filter(Boolean).join(" ") || undefined,
          "aria-invalid": error ? true : node.props["aria-invalid"],
          "aria-required": required || node.props["aria-required"] || undefined,
        });
      }
      return node.props.children ? React.cloneElement(node, {}, associate(node.props.children)) : node;
    });
  }
  const controls = associate(children || <div className="relative">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true">{icon}</span>}<input className={"ui-input " + (icon ? "pl-10" : "")} type={type} value={value ?? ""} disabled={disabled} onChange={event => onChange?.(event.target.value)} placeholder={placeholder} /></div>);
  return <div className={"ui-field " + className} role="group" aria-labelledby={labelId}>
    <label id={labelId} htmlFor={firstControl} className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-blue-600" aria-hidden="true">*</span>}</label>
    {description && !error && <p id={helpId} className="mb-3 text-xs text-slate-500">{description}</p>}
    {controls}
    {error && <p id={helpId} className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
  </div>;
}
