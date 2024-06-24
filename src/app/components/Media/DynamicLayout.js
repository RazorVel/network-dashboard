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
            {React.Children.map(children, (child, i) => {
                let key = (child.props.key != undefined) ? child.props.key : i;

                return (
                    <div 
                        className="w-full h-full flex justify-center bg-gray-50 ring ring-gray-200 ring-offset-0 rounded-md overflow-hidden"
                        data-grid={ 
                            child.props["data-grid"] ? {   
                                x:0, 
                                y:0,
                                w:1,
                                h:1,
                                minW:1,
                                maxW:cols,
                                minH:1,
                                maxH:10e10,
                                static:false,
                                isDraggable:true,
                                isResizable:true,
                                resizeHandles: availableHandles,
                                i: key,
                                ...child.props["data-grid"],
                            } : {
                                x: child.props.x || 0,
                                y: child.props.y || 0,
                                w: child.props.w || 1, 
                                h: child.props.h || 1,
                                minW: child.props.minW || 1,
                                maxW: child.props.maxW || cols, // Maximum width
                                minH: child.props.minH || 1, // Minimum height
                                maxH: child.props.maxH || 10e10, // Maximum height
                                static: child.props.static ? true : false,
                                isDraggable: child.props.isDraggable !== undefined ? child.props.isDraggable : true,
                                isResizable: child.props.isResizable !== undefined ? child.props.isResizable : true,
                                resizeHandles: child.props.resizeHandles instanceof Array ? child.props.resizeHandles : availableHandles,
                                i: key,
                            }
                        }
                    >
                        {child}
                    </div>
                )
            })}
        </ReactGridLayout>
    );
}

export default DynamicLayout;
