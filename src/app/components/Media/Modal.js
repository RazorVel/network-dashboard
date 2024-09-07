import React, { useRef, useEffect, useState, Children } from "react";
import { createPortal } from "react-dom";
import { IoMdHelpCircleOutline as Help } from "react-icons/io";
import { IoMdArrowRoundBack as Back } from "react-icons/io";

export const Modal = ({ title, isOpen, secondary = false, onRequestClose, children }) => {
    const [showSecondary, setShowSecondary] = useState(false);

    const modalRef = useRef(null);
    const isResizing = useRef(false); // Track resizing state

    useEffect(() => {
        if (!modalRef.current) return;

        const handleMouseDown = (e) => {
            if (e.target.classList.contains("resize-handle")) {
                isResizing.current = true;
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
            }
        };

        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            const modal = modalRef.current;
            const rect = modal.getBoundingClientRect();
            modal.style.width = `${e.clientX - rect.left}px`;
            modal.style.height = `${e.clientY - rect.top}px`;
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        modalRef.current.addEventListener("mousedown", handleMouseDown);

        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener(
                    "mousedown",
                    handleMouseDown
                );
            }
        };
    }, []);

    const originalOnRequestClose = onRequestClose;

    onRequestClose = () => {
        setShowSecondary(false);
        originalOnRequestClose();
    };

    if (!isOpen) return null;

    if (title) {
        title = title.toString().toLowerCase();
        title = title.charAt(0).toUpperCase() + title.substring(1);
    }

    const mainHeader = title ? (
        <>
            <div className="flex gap-3 items-center">
                <h1 className="text-3xl break-all">{title}</h1>
                {secondary && (
                    <Help
                        className="text-3xl text-gray-500 hover:text-gray-700 transition-colors duration-300 cursor-pointer h-6 w-6"
                        onClick={() => setShowSecondary(true)}
                    />
                )}
            </div>
            <hr className="border border-black mb-4" />
        </>
    ) : null;

    const secondaryHeader = (
        <>
            <div 
                className="text-3xl text-gray-500 hover:text-gray-700 break-all cursor-pointer flex gap-3 items-center"
                onClick={() => setShowSecondary(false)}
            >
                <Back className="h-6 w-6"/>
                <h1>back</h1>
            </div>
            <hr className="border border-black mb-4" />
        </>
    );

    if (secondary) {
        children = Children.toArray(children);
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        >
            <div
                ref={modalRef}
                className="flex flex-col bg-white p-6 rounded-lg shadow-lg relative min-w-64 min-h-40 max-w-[80%] max-h-[80%] w-[40rem] resize"
                style={{ overflow: "auto" }}
            >
                <button 
                    onClick={onRequestClose}
                    className="absolute top-1 right-4 text-3xl text-gray-500 hover:text-gray-700 transition-colors duration-300 cursor-pointer"
                >
                    ×
                </button>
                {showSecondary ? secondaryHeader : mainHeader}
                <div className="flex-[1] overflow-auto">
                    {secondary ? (showSecondary ? (children[1]) : (children[0])) : children}
                </div>
                <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"></div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
