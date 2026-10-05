import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function FloatingPanel({ anchorRef, onClose, children, label = "Actions", width = 240 }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const panel = panelRef.current.getBoundingClientRect();
      const below = window.innerHeight - anchor.bottom - 16;
      const top = below >= panel.height || below >= anchor.top - 16 ? Math.min(anchor.bottom + 8, window.innerHeight - panel.height - 8) : anchor.top - panel.height - 8;
      setPosition({ top: Math.max(8, top), left: Math.max(8, Math.min(anchor.right - panel.width, window.innerWidth - panel.width - 8)) });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(panelRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    panelRef.current.querySelector("button,a")?.focus();
    return () => { observer.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [anchorRef]);
  useLayoutEffect(() => {
    const outside = event => { if (!panelRef.current?.contains(event.target) && !anchorRef.current?.contains(event.target)) onClose(); };
    const key = event => { if (event.key === "Escape") { onClose(); anchorRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); };
  }, [anchorRef, onClose]);
  return createPortal(<div ref={panelRef} role="region" aria-label={label} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl" style={{ position: "fixed", zIndex: 200, width, maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100dvh - 16px)", overflowY: "auto", overscrollBehavior: "contain", ...position }}>{children}</div>, document.body);
}
