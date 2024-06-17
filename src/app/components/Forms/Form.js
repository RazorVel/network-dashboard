import React, { useState, useEffect } from "react";

const Form = ({ initialData, formType, onSubmit, onRequestClose, children }) => {
    let stateInitial = {};

    if (formType == "field") {
        stateInitial = {
            name: "",
            derivatives: "",
            pattern: "",
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
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        const data = {
            ...initialData,
            ...formData,
            derivatives: formData.derivatives ? formData.derivatives.split(",").map((d) => d.trim()) : [],
        };
        onSubmit(data);
        onRequestClose();
    };

    const addPropsToChildren = (children) => {
        return React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                if (child.type === React.Fragment) {
                    return addPropsToChildren(child.props.children);
                }
                return React.cloneElement(child, {
                    value: formData[child.props.name],
                    onChange: handleChange,
                });
            }
            return child;
        });
    };

    const childrenWithProps = addPropsToChildren(children);

    return (
        <div className="space-y-4">
            {childrenWithProps}
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Submit</button>
        </div>
    );
};

export default Form;
