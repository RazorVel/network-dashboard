import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { SlGraph as Graph } from "react-icons/sl";
import { LuRegex as Regex } from "react-icons/lu";
import { PiFlaskBold as Flask } from "react-icons/pi";

export const Navigation = ({
    className,
    ...props
}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <nav
            className={classNames(
                "transition-all duration-300 ease-in-out",
                "bg-white text-grey-800 border border-r-2 border-zinc-400 shadow-md shadow-slate-300 py-4",
                className
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
            {...props}
        >  
            <ul className="flex flex-col gap-4 px-4">
                <Link to="/client/" className="nav-link flex items-center relative group">
                    <div className="icon-container transition-all duration-300 ease-in-out rounded-full group-hover:rounded-lg bg-gray-200 group-hover:bg-blue-500 p-4">
                        <Graph className="h-6 w-6"/>
                    </div>
                    {!isCollapsed && (
                        <>
                        <div className="mx-3 w-2 h-6 border border-l bg-blue-500 rounded-lg"></div>
                        <span className="ml-2 mr-2">Dashboard</span>
                        </>
                    )}
                </Link>
                <Link to="/client/field" className="nav-link flex items-center relative group">
                    <div className="icon-container transition-all duration-300 ease-in-out rounded-full group-hover:rounded-lg bg-gray-200 group-hover:bg-green-500 p-4">
                        <Regex className="h-6 w-6"/>
                    </div>
                    {!isCollapsed && (
                        <>
                        <div className="mx-3 w-2 h-6 border border-l bg-green-500 rounded-lg"></div>
                        <span className="ml-2 mr-2">RegExp Patterns</span>
                        </>
                    )}
                </Link>
                <Link to="/client/parser" className="nav-link flex items-center relative group">
                    <div className="icon-container transition-all duration-300 ease-in-out rounded-full group-hover:rounded-lg bg-gray-200 group-hover:bg-red-500 p-4">
                        <Flask className="h-6 w-6"/>
                    </div>
                    {!isCollapsed && (
                        <>
                        <div className="mx-3 w-2 h-6 border border-l bg-red-500 rounded-lg"></div>
                        <span className="ml-2 mr-2">Parsing Instructions</span>
                        </>
                    )}
                </Link>
            </ul>
        </nav>
    );
}


export default Navigation;