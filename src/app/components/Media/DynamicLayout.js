import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);

export const DynamicLayout = ({
    children,
    cols = 12,
    rowHeight = 30,
    onLayoutChange = () => {}
}) => {
    const availableHandles =  ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

    return (
        <ReactGridLayout
            className="layout"
            cols={cols}
            rowHeight={rowHeight}
            onLayoutChange={onLayoutChange}
            autoSize={true} // Automatically adjust container height
        >
            {React.Children.map(children, (child, i) => (
                <div 
                    key={i} 
                    className="w-full h-full bg-gray-200 drop-shadow shadow-black rounded-md overflow-hidden"
                    data-grid={{
                        x: 0, //Start at the first column
                        y: i, //Place each item in a new row
                        w: cols, //Span all columns
                        h: 1, //Initial height (can be adjusted)
                        i: i.toString(),
                        resizeHandles: availableHandles
                    }}
                >
                    {child}
                </div>
            ))}
        </ReactGridLayout>
    );
}

export default DynamicLayout;
