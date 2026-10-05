import { createPortal } from "react-dom";
import { ModalFrame } from "../ui";

export default function CandidateDrawer({ children, ...props }) {
  return createPortal(
    <ModalFrame {...props} style={{ height: "100dvh", overflow: "hidden", padding: 0 }}>
      {children}
    </ModalFrame>,
    document.body,
  );
}
