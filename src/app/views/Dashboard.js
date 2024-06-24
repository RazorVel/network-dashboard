import { AppContext } from "../context.js";
import React, { useState, useEffect, useContext, useCallback } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import classNames from "classnames";
import axios from "axios";
import Modal from "../components/Media/Modal.js";
import DynamicLayout from "../components/Media/DynamicLayout.js";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import LogStack from "../components/Widget/LogStack.js";
import Controls from "../components/Widget/Controls.js";
import ProportionalChart from "../components/Widget/ProportionalChart.js";
import {v4 as uuidv4} from "uuid";

const Dashboard = ({
    className,
    ...props
}) => {
    const defaultLayoutConfig = [
        { type: "Controls", i: uuidv4(), x: 0, y: 0, w: 20, h: 2, isResizable: false, isDraggable: false },
        { type: "LogStack", i: uuidv4(), x: 0, y: 0, w: 20, h: 10 }
    ];

    const { setIsLoading, logCache } = useContext(AppContext);
    const [layoutConfig, setLayoutConfig] = useState([]);
    const [updatedConfig, setUpdatedConfig] = useState([]);

    const [isStreamPaused, setIsStreamPaused] = useState(false);
    const [responseModalIsOpen, setResponseModalIsOpen] = useState(false);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseDetail, setResponseDetail] = useState(null);

    const showServerResponse = (response) => {
        setResponseStatus(response?.status);
        setResponseMessage(response?.data?.message);
        setResponseDetail(response?.data?.error || response?.data?.result);

        if (response instanceof Error) {
            setResponseStatus("-");
            setResponseMessage("Connection is lost");
            setResponseDetail(response);
        }

        setResponseModalIsOpen(true);
    };

    const handleSave = () => {
        localStorage.setItem("layoutConfig", JSON.stringify(updatedConfig));
        alert("Layout saved!");
    }
    
    const handleReset = () => {
        setLayoutConfig(defaultLayoutConfig);
        setUpdatedConfig(defaultLayoutConfig);
        localStorage.setItem("layoutConfig", JSON.stringify(defaultLayoutConfig));
        alert("Layout reset!");
    }

    const renderComponent = (item) => {
        switch (item.type) {
            case 'Controls':
                return <Controls onSave={handleSave} onReset={(handleReset)} className="w-full h-full" />;
            case 'LogStack':
                return <LogStack className="w-full h-full p-2" />;
            default:
                return <></>;
        }
    };

    const onLayoutChange = (layouts) => {        
        // Merge the existing layoutConfig with the new layout positions
        const updatedLayouts = layouts.map((layout) => {
            const existingLayout = updatedConfig.find((item) => item.i.toString().replace(/^(\.\$)*/g, "") === layout.i.replace(/^(\.\$)*/g, ""));
            return {
                ...layout,
                type: existingLayout ? existingLayout.type : layout.type,
            };
        });
        setUpdatedConfig(updatedLayouts);
    };

    useEffect(() => {
        let stored = localStorage.getItem("layoutConfig");

        try {
            stored = JSON.parse(stored);

            if (!(stored instanceof Array)) {
                throw new Error("localStorage layout config is not array");
            }

            setLayoutConfig(() => stored);
            setUpdatedConfig(() => stored);
        } catch (err) {
            setLayoutConfig(() => defaultLayoutConfig);
            setUpdatedConfig(() => defaultLayoutConfig);
        }
    }, []);


    return (
        <div className={classNames(className)} {...props}>
            <DynamicLayout cols={20} rowHeight={30} onLayoutChange={onLayoutChange}>
                {layoutConfig && layoutConfig.map((item, i) => (
                    <div key={item.i} className="w-full h-full" data-grid={{...item}}>
                        {renderComponent(item)}
                    </div>
                ))}
            </DynamicLayout>

            <Modal  
                title={"Server Response"}
                isOpen={responseModalIsOpen}
                onRequestClose={() => setResponseModalIsOpen(false)}
            >
                {responseMessage && (
                    <div className="mt-4 p-2 rounded">
                        <p className={"text-lg " + (responseStatus === 200 ? "text-green-500" : "text-red-500")}>
                            Status: {responseStatus}
                        </p>
                        <p className="text-lg">{responseMessage}</p>
                        {responseDetail && (
                            <pre className="bg-gray-200 rounded min-h-10 max-h-48 overflow-y-scroll text-lg break-words">
                                {JSON.stringify(responseDetail, Object.getOwnPropertyNames(responseDetail), 4)}
                            </pre>   
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )

}

export default Dashboard;