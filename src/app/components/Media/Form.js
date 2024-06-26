import React, { useState, useEffect } from "react";
import classNames from "classnames";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json.js";
import "ace-builds/src-noconflict/theme-tomorrow.js";
import "ace-builds/src-noconflict/ext-language_tools.js";
import "ace-builds/src-noconflict/keybinding-vim.js";

export const Label = ({ 
    className,
    label,
    ...props
}) => (
    <label className={classNames("block text-gray-700", className)} {...props}>{label}</label>
);

export const Input = ({ 
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
                className={classNames("w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300", className)}
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

export const Select = ({
    className,
    placeholder,
    name,
    value,
    onChange = () => {},
    options = [],
    notifyChange = () => {},
    ...props
}) => {
    useEffect(() => {
        if (options.length) {
            const event = {target: {name, value: options[0]?.[0]}};
            onChange(event);
            notifyChange(event);
        }
    }, []);

    return (
        <select 
            className={classNames("w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300", className)} 
            name={name} 
            onChange={function () {
                notifyChange(...arguments);
                onChange(...arguments);
            }} 
            {...props}
        >
            {placeholder && (
                <option key={-1} value="" disabled>{placeholder}</option>
            )}
            {options instanceof Array && options.map((option, i) => (
                <option key={i} value={option[0]}>{option[1]}</option>
            ))}
        </select>
    )
};

export const Form = ({ 
    className,
    initialData = {}, 
    formType, 
    onSubmit, 
    onRequestClose, 
    children,
    initialSubmitMode = "default",
    ...props
}) => {
    let [ isValid, setIsValid ] = useState(false);
    let [ invalidReason, setInvalidReason ] = useState("");
    let [ submitMode, setSubmitMode ] = useState(initialSubmitMode);
    
    let stateInitial = {};

    if (formType == "field") {
        stateInitial = {
            name: "",
            derivatives: "",
            pattern: "",
        }
    }
    else if (formType == "parser") {
        stateInitial = {
            type: "",
            lookups: "",
            jobs: "",
        }
    }
    
    const [formData, setFormData] = useState(stateInitial);

    useEffect(() => {
        if (initialData && formType == "field") {
            setFormData({
                name: initialData.name || "",
                derivatives: (initialData.derivatives || []).join(", "),
                pattern: initialData.pattern || "",
            });
        }
        else if (initialData && formType == "parser") {
            setFormData({
                type: initialData.type || "",
                lookups: (initialData.lookups || []).join(", "),
                jobs: JSON.stringify(initialData.jobs, null, 4)
            });
        }

    }, [initialData]);

    useEffect(() => {
        validate();
    }, [formData]);

    const validate = () => {
        const setInvalid = (reason) => {
            setIsValid(false);
            setInvalidReason(reason);
        }

        if (formType == "field") {
            if (formData.name == "") {
                return setInvalid("Invalid name: empty");
            }
            if (!(/^[\w_]+$/.test(formData.name))) {
                return setInvalid("Invalid name: only alphanumeric and underscore allowed");
            }
            if (formData.name.startsWith("_")) {
                return setInvalid("Invalid name: should not start with _");
            }
            if (formData.name.endsWith("_")) {
                return setInvalid("Invalid name: should not end with _");
            }
            if (formData.pattern == "") {
                return setInvalid("Invalid pattern: empty");
            }
        }
        else if (formType == "parser") {
            if (formData.type == "") {
                return setInvalid("Invalid type: empty");
            }
            if (!(/^[\w_]+$/.test(formData.type))) {
                return setInvalid("Invalid name: only alphanumeric and underscore allowed");
            }
            if (formData.type.startsWith("_")) {
                return setInvalid("Invalid name: should not start with _");
            }
            if (formData.type.endsWith("_")) {
                return setInvalid("Invalid name: should not end with _");
            }

            try {
                let jobs = JSON.parse(formData.jobs);

                if (!(jobs instanceof Array)) {
                    return setInvalid("Invalid jobs: expected value is array");
                }

                for (let job of jobs) {
                    if (!(job instanceof Object)) {
                        return setInvalid("Invalid jobs: expected objects in array");
                    }
                }
            } 
            catch(err) {
                return setInvalid("Invalid jobs: unable to parse input");
            }
        }

        setIsValid(true);
        setInvalidReason("");
    };

    const handleChange = (e, name) => {
        let value;
        if (typeof e === 'string') {
            // This is for AceEditor
            value = e;
        } else {
            // This is for standard input elements
            const { name: eventName, value: eventValue } = e.target;
            name = eventName;
            value = eventValue;
        }
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        let data = {};

        if (formType == "field") {
            data = {
                ...initialData,
                ...formData,
                derivatives: formData.derivatives ? formData.derivatives.split(",").map((d) => d.trim()) : [],
            }
        }
        else if (formType == "parser") {
            data = {
                ...initialData,
                ...formData,
                lookups: formData.lookups ? formData.lookups.split(",").map((d) => d.trim()) : [],
                jobs: JSON.parse(formData.jobs)
            }
        }
        else {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) && child.props.name && !Array.isArray(child.props.value)) {
                    data[child.props.name] = formData[child.props.name];
                }
            });
        }

        onSubmit(data);
        onRequestClose();
    };

    const addPropsToChildren = (children) => {
        return React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                if (child.type === React.Fragment) {
                    return addPropsToChildren(child.props.children);
                }

                const handleEditorChange = (value) => handleChange(value, child.props.name)

                return React.cloneElement(child, {
                    value: formData[child.props.name],
                    onChange: child.props.type === "code-editor" ? handleEditorChange : handleChange,
                });
            }
            return child;
        });
    };

    const childrenWithProps = addPropsToChildren(children);

    return (
        <div className={classNames("space-y-4", className)} {...props}>
            {childrenWithProps}

            {!isValid && invalidReason && (
                <p className="text-red-600 text-base">{invalidReason}</p>
            )}

            { submitMode == "default" && (
                <>
                {(isValid) ? (
                    <button onClick={() => setSubmitMode(() => "confirmation")} className="w-full bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Submit</button>
                    ) : (
                        <button className="w-full bg-gray-500 text-white px-4 py-2 rounded shadow" disabled>Submit</button>
                    )}
                </>
            )}
            {/* razorvel (FH) was here Sunday Jun 23, 2024 22:38:42 :). Thank you! */}
            {/* {NI, BD says hi as well :D} */}
            { submitMode == "confirmation" && (
                <>
                {(isValid) ? (
                    <div className="w-full flex gap-6">
                        <button onClick={handleSubmit} className="w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors duration-300">Confirm</button>
                        <button 
                            onClick={() => {
                                if (initialSubmitMode == "confirmation") {
                                    onRequestClose();
                                }
                                else {
                                    setSubmitMode(() => "default");
                                }
                            }}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition-colors duration-300"
                        >Cancel</button>
                    </div>
                ) : (
                    <button className="w-full bg-gray-500 text-white px-4 py-2 rounded shadow" disabled>Submit</button>
                )}
                </>
            )}
        </div>
    );
};

export default Form;


