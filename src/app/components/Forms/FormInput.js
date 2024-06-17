import React from "react";

const FormInput = ({ name, value, onChange }) => (
    <input type="text" name={name} value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"/>
);

export default FormInput;
