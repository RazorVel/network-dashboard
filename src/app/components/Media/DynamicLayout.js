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
                    className="w-full h-full bg-gray-50 ring ring-gray-200 ring-offset-0 rounded-md overflow-hidden"
                    data-grid={{
                        x: child.props.x || 0, //Start at the first column
                        y: child.props.y || i, //Place each item in a new row
                        w: child.props.w || cols, //Span all columns
                        h: child.props.h || 1, //Initial height (can be adjusted)
                        static: child.props.static ? true : false,
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
