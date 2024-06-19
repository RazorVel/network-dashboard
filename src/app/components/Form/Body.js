import React, { useState, useEffect } from "react";

const Form = ({ initialData, formType, onSubmit, onRequestClose, children }) => {
    let [ isValid, setIsValid ] = useState(false);
    let [ invalidReason, setInvalidReason ] = useState("");
    
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
            if (formData.pattern == "") {
                return setInvalid("Invalid pattern: empty");
            }
        }
        else if (formType == "parser") {
            if (formData.type == "") {
                return setInvalid("Invalid type: empty");
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
        <div className="space-y-4">
            {childrenWithProps}

            {!isValid && invalidReason && (
                <p className="text-red-600 text-base">{invalidReason}</p>
            )}

            {isValid && (
                <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Submit</button>

            ) || (
                <button className="bg-gray-500 text-white px-4 py-2 rounded shadow" disabled>Submit</button>
            )}
        </div>
    );
};

export default Form;
