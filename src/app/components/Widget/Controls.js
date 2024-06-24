import React, {useContext} from "react";
import classNames from "classnames";
import { PiPause as Pause, PiPlay as Play } from "react-icons/pi";
import { GrRefresh as Refresh } from "react-icons/gr";
import { TbPlus as Plus } from "react-icons/tb"; 
import { FaRegSave as RegSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context.js";
import { RxReset as Reset } from "react-icons/rx";


export const Controls = ({ 
    className, 
    onSave = () => {},
    onReset = () => {},
    ...props 
}) => {
    const navigate = useNavigate();
    const {isStreamPaused, setIsStreamPaused} = useContext(AppContext);

    return (
        <div className={classNames("bg-gray-100 flex justify-around", className)} {...props}>
            <div className="flex gap-4 items-center">
                <Play
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] transition-all ease-in-out",
                        isStreamPaused ? "cursor-pointer shadow-none filter-none" : "cursor-auto shadow-md filter grayscale bg-gray-400"
                    )}
                    title="resume stream"
                    style={{ color: isStreamPaused ? "#b8bb26" : "#333333" }}
                    onClick={() => {
                        setIsStreamPaused(() => false);
                    }}
                />
                <Pause
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] transition-all ease-in-out",
                        isStreamPaused ? "cursor-auto shadow-md filter grayscale bg-gray-400" : "cursor-pointer shadow-none filter-none"
                    )}
                    title="pause stream"
                    style={{ color: isStreamPaused ? "#333333" : "#f25e5f" }}
                    onClick={() => {
                        setIsStreamPaused(() => true);
                    }}
                />
                <Refresh
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] cursor-pointer"
                    )}
                    title="refresh application"
                    style={{ color: "#1565c0" }}
                    onClick={() => {
                        navigate(0);
                    }}
                />
                <Plus
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] cursor-pointer"
                    )}
                    title="create widgets"
                    style={{ color: "#000000" }}
                    onClick={() => {
                        
                    }}
                />
                <RegSave
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] cursor-pointer"
                    )}
                    title="save layouts"
                    style={{ color: "#000000" }}
                    onClick={onSave}
                />
                <Reset
                    className={classNames(
                        "h-6 w-6 p-0.5",
                        "rounded-md ring ring-offset-0 ring-gray-500",
                        "hover:scale-[1.1] cursor-pointer"
                    )}
                    title="reset layouts"
                    style={{ color: "#000000" }}
                    onClick={onReset}
                />
            </div>
        </div>
    );
};

export default Controls;
