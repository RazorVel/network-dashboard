import React, {useContext} from "react";
import classNames from "classnames";
import { PiPause as Pause, PiPlay as Play } from "react-icons/pi";
import { GrRefresh as Refresh } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context.js";


export const Controls = ({ className, ...props }) => {
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
                    style={{ color: "#1565c0" }}
                    onClick={() => {
                        navigate(0);
                    }}
                />
            </div>
        </div>
    );
};

export default Controls;
