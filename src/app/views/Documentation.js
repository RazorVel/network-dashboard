import React, { useContext } from "react";
import classNames from "classnames";
import { AppContext } from "../context.js";
import Markdown from "../components/Media/Markdown.js";

const Documentation = ({ className, ...props }) => {
    const { documentation } = useContext(AppContext);
    
    return (
        <div className={classNames("p-4 w-full", className)} style={{width: "calc(100% - 90px)"}} {...props}>
            <Markdown document={documentation} />
        </div>
    );
};

export default Documentation;
