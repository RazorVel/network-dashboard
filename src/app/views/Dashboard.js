import { AppContext } from "../context.js";
import React, { useState, useEffect, useContext } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import classNames from "classnames";
import axios from "axios";
import Modal from "../components/Media/Modal.js";
import DynamicLayout from "../components/Media/DynamicLayout.js";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";


const Dashboard = ({
    className,
    ...props
}) => {
    const { setIsLoading } = useContext(AppContext);
    const [data, setData] = useState([]);
    const [responseModalIsOpen, setResponseModalIsOpen] = useState(false);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseDetail, setResponseDetail] = useState(null);

    useEffect(() => {
        const fetchData = async() => {
            try {
                setIsLoading(true);
                const response = await axios.get("/log");
                setData(response.data.data);
            } catch (error) {
                showServerResponse(error?.response || error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

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
            <DynamicLayout>
                <div className="bg-red-300 h-full w-full"></div>
                <div className="bg-green-300 h-full w-full"></div>
                <div className="bg-blue-300 h-full w-full"></div>
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