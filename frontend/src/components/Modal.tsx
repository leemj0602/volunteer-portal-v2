import React from "react";
import ReactModal from "react-modal";

interface ModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title: string;
    children: React.ReactNode;
}

ReactModal.setAppElement("#root"); // Set the app root for accessibility

const Modal: React.FC<ModalProps> = ({ isOpen, onRequestClose, title, children }) => {
    return (<>
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal-content w-full px-0 md:px-6 max-w-[1200px] mx-auto"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>{title}</h2>
                <button onClick={onRequestClose} className="modal-close">
                    &times;
                </button>
            </div>
            <div className="modal-body">{children}</div>
        </ReactModal>
        <style>
            {`
            .modal-overlay {
                background: rgba(0, 0, 0, 0.5);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-content {
                background: #f4f5fb;
                border-radius: 8px;
                padding: 20px;
                width: 600px;
                max-width: 100%;
                position: relative;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #ccc;
                margin-bottom: 10px;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .modal-body {
                padding: 10px 0;
            }
            `}
        </style>
    </>);
};

export default Modal;
