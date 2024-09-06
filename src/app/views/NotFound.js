import React from "react";
import classNames from "classnames";

const NotFound = ({
    className,
    ...props
}) => (
    <div className={classNames("p-4", className)} {...props}>
        <h1><b>404</b> Not Found</h1>
        <p>The page you are looking for does not exist.</p>
    </div>
)

export default NotFound;