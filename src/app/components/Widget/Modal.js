import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ 
    title, 
    isOpen, 
    onRequestClose, 
    children 
}) => {
    const modalRef = useRef(null);
    const isResizing = useRef(false); // Track resizing state

    useEffect(() => {
        if (!modalRef.current) return;

        const handleMouseDown = (e) => {
            if (e.target.classList.contains('resize-handle')) {
                isResizing.current = true;
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
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
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        modalRef.current.addEventListener('mousedown', handleMouseDown);

        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener('mousedown', handleMouseDown);
            }
        };
    }, []);

    if (!isOpen) return null;

    title = title.toString().toLowerCase();
    title = title.charAt(0).toUpperCase() + title.substring(1);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div ref={modalRef} className="flex flex-col bg-white p-6 rounded-lg shadow-lg relative min-w-64 min-h-40 max-w-[80%] max-h-[80%] w-[40rem] resize" style={{ overflow: 'auto' }}>
                <button onClick={onRequestClose} className="absolute top-1 right-4 text-3xl text-gray-500 hover:text-gray-700 transition-colors duration-300">×</button>
                <h1 className="text-3xl">{title}</h1>
                <hr className="border border-black mb-4"/>
                <div className="flex-[1]">{children}</div>
                <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"></div>
            </div>
        </div>
    , document.body);
};

export default Modal;
