import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames";
import axios from "axios";
import Modal from "../../components/Widget/Modal.js";
import Form from "../../components/Form/Body.js";
import FormLabel from "../../components/Form/Label.js";
import FormInput from "../../components/Form/Input.js";
import ParserTable from "../../components/Parser/Table.js";
import { AppContext } from "../../context.js";

const ParserLookups = ({
    className,
    ...props
}) => {
    const { setIsLoading } = useContext(AppContext);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);
    const [responseModalIsOpen, setResponseModalIsOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseDetail, setResponseDetail] = useState(null);
    const [actionType, setActionType] = useState(null);

    useEffect(() => {
        const fetchData = async() => {
            try {
                setIsLoading(true);
                const response = await axios.get("/parser?option=raw");
                setData(response.data);
            } catch (error) {
                showServerResponse(error?.response || error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (responseModalIsOpen === false) {
            setResponseStatus(null);
            setResponseMessage("");
            setResponseDetail(null);
        }
    }, [responseModalIsOpen]);

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
    
    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const handleCreate = () => {
        setFormData(null);
        setFormModalIsOpen(true);
        setActionType("create");
    }

    const handleModify = (item) => {
        setFormData(item);
        setFormModalIsOpen(true);
        setActionType("modify");
    }

    const handleDelete = async (id) => {
        try {
            setIsLoading(true);
            const response = await axios.delete("/parser", {
                data: [{ _id: id }],
            });
            showServerResponse(response);
            // Reload data
            const updatedData = await axios.get("/parser?option=raw");
            setData(updatedData.data);
        } catch (error) {
            showServerResponse(error?.response || error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (item) => {
        try {
            setIsLoading(true);
            const response = await axios.post("/parser", [item]);
            showServerResponse(response);
            // Reload data
            const updatedData = await axios.get("/parser?option=raw");
            setData(updatedData.data);
        } catch (error) {
            showServerResponse(error?.response || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classNames(className)} {...props}>
            <ParserTable className="container mx-auto p-4"
                data={data}
                search={search}
                onSearch={handleSearch}
                onModify={handleModify}
                onDelete={handleDelete}
                onCreate={handleCreate}
            />
            <Modal
                title={actionType}
                isOpen={formModalIsOpen}
                onRequestClose={() => setFormModalIsOpen(false)}
            >
                <Form
                    className="h-full flex flex-col"
                    initialData={formData}
                    formType={("parser")}
                    onSubmit={handleSubmit}
                    onRequestClose={() => setFormModalIsOpen(false)}
                >
                    <FormLabel label="Type"/>
                    <FormInput name="type"/>
                    <FormLabel label="Lookups"/>
                    <FormInput name="lookups"/>
                    <FormLabel label="Jobs"/>
                    <FormInput className="flex-[1] min-h-[300px]" type="code-editor" name="jobs"/>
                </Form>
            </Modal>
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

export default ParserLookups;