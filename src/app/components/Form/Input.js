import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json.js";
import "ace-builds/src-noconflict/theme-tomorrow.js";
import "ace-builds/src-noconflict/ext-language_tools.js";
import "ace-builds/src-noconflict/keybinding-vim.js";


const FormInput = ({ 
    type = "text",
    placeholder, 
    name, 
    value, 
    onChange 
}) => (
    <>
        {type == "code-editor" && (
            <>
                <AceEditor.default 
                    className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300 min-h-20 max-h-64"
                    mode="json"
                    theme="tomorrow"
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    fontSize={20}
                    width="100%"
                    height="200px"
                    setOptions={{
                        showLineNumbers: true,
                        tabSize: 4,
                    }}
                />
            </>
        )}
        {type == "textarea" && (
            <textarea placeholder={placeholder} name={name} value={value} onChange={onChange} onKeyUp={onChange} className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300 min-h-20 max-h-64"></textarea>
        )}
        {!["code-editor", "textarea"].includes(type) && (
            <input type={type} placeholder={placeholder} name={name} value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"/>
        )}
    </>
);

export default FormInput;
