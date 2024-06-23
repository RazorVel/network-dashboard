import { AppContext } from "../context.js";
import React, { useState, useEffect, useContext } from "react";
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

const Dashboard = ({
    className,
    ...props
}) => {
    const { setIsLoading, logCache } = useContext(AppContext);

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

    return (
        <div className={classNames(className)} {...props}>
            <DynamicLayout cols={20} rowHeight={30}>
                <Controls className="h-full w-full" h={2} w={20}/>
                <LogStack className="h-full w-full p-4" h={10} w={20}/>
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