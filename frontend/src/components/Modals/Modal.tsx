// ─── Modal Component ───
// This file defines a reusable modal component that can be used throughout the application.
// The modal can be opened or closed based on the `open` prop.
// It accepts a title, children (content), an onClose function, and an open boolean prop.
// This modal is styled with Bootstrap classes and includes a backdrop.

import type { ReactNode } from "react";
import Button from "../Buttons/Button";

interface ModalProps {
  title?: ReactNode; // Title of the modal, can be a string or any ReactNode (optional)
  children: ReactNode; // Content to be displayed inside the modal
  onClose: () => void;
  open: boolean;
}

// Modal component that displays a modal dialog with a title and content
// It includes a close button that triggers the onClose function when clicked.
// The modal is only rendered when the `open` prop is true.
// The modal is styled with Bootstrap classes and includes a backdrop.

const Modal = ({ title, children, onClose, open }: ModalProps) => {
  if (!open) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        role="dialog"
        style={{ display: "block" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable bg-transparent"
          role="document"
        >
          <div className="modal-content rounded-5 border-0 p-3">
            <div className="modal-body">
              <div className="d-flex justify-content-between pb-3">
                <h5 className="modal-title fw-bold fs-3">{title}</h5>
                <Button
                  className="btn btn-close fs-4"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={onClose}
                  children={undefined}
                ></Button>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default Modal;
