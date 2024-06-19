import React from "react";
import classNames from "classnames";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json.js";
import "ace-builds/src-noconflict/theme-tomorrow.js";
import "ace-builds/src-noconflict/ext-language_tools.js";
import "ace-builds/src-noconflict/keybinding-vim.js";

const FormInput = ({ 
    className,
    type = "text",
    placeholder, 
    name, 
    value, 
    onChange,
    ...props
}) => (
    <>
        {type == "code-editor" && (
            <AceEditor.default 
                className={classNames("w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300", className)}
                mode="json"
                theme="tomorrow"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                fontSize={20}
                width="100%"
                height="300px"
                setOptions={{
                    showLineNumbers: true,
                    tabSize: 4,
                }}
                {...props}
            />
        )}
        {type == "textarea" && (
            <textarea 
                className={classNames("w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300 min-h-20 max-h-64", className)} 
                placeholder={placeholder} 
                name={name} 
                value={value} 
                onChange={onChange} 
                onKeyUp={onChange} 
                {...props}
            >

            </textarea>
        )}
        {!["code-editor", "textarea"].includes(type) && (
            <input 
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
                type={type} 
                placeholder={placeholder} 
                name={name} 
                value={value} 
                onChange={onChange} 
                {...props}
            />
        )}
    </>
);

export default FormInput;
