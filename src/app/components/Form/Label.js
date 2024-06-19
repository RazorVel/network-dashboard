import React from "react";
import classNames from "classnames";

const FormLabel = ({ 
    className,
    label,
    ...props
}) => (
    <label className={classNames("block text-gray-700", className)} {...props}>{label}</label>
);

export default FormLabel;
