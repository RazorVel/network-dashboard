import React, { useState, useEffect } from "react";
import classNames from "classnames";

export const TopBar = ({
    className,
    ...props
}) => {
    const [ time, setTime ]= useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
          setTime(new Date());
        }, 1000);
    
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      }, []);

    return (
        <div 
            className={classNames(
                "w-full h-8 text-lg",
                "sticky flex justify-around",
                "bg-stone-900 text-gray-300 ",
                className
            )}
            {...props}
        >
            {time.toLocaleString().replace(/[^\w\d\s:\/]/g, "")}
        </div>
    )
}

export default TopBar;