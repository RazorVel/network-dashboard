import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ title, isOpen, onRequestClose, children }) => {
    if (!isOpen) return null;

    title = title.toString().toLowerCase();
    title = title.charAt(0).toUpperCase() + title.substring(1);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg">
                <button onClick={onRequestClose} className="absolute top-1 right-4 text-3xl text-gray-500 hover:text-gray-700 transition-colors duration-300">×</button>
                <h1 className="text-3xl">{title}</h1>
                <hr className="border border-black mb-4"/>
                <div>{children}</div>
            </div>
        </div>
    , document.body);
};

export default Modal;
