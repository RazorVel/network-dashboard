import { AppContext } from "../context.js";
import React, { useState, useEffect, useContext, act } from "react";
import classNames from "classnames";
import axios from "axios";
import Modal from "../components/Media/Modal.js";
import { Form, Label, Input } from "../components/Media/Form.js";

export const Table = ({
    className,
    data,
    search,
    onSearch,
    onModify,
    onDelete,
    onCreate,
    onMerge,
    ...props
}) => {
    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.derivatives.join(", ").toLowerCase().includes(search.toLowerCase()) ||
        item.pattern.toLowerCase().includes(search.toLowerCase())
    );

    filteredData.sort((x, y) => x.name.toLowerCase() <= y.name.toLowerCase() ? -1 : 1);

    return (
        <div className={classNames("space-y-4", className)} {...props}>
            <div className="flex justify-end mb-4 gap-5">
                <button onClick={onMerge} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Merge</button>
                <button onClick={onCreate} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Create</button>
                <Input 
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={onSearch}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Derivatives</th>
                            <th className="border p-2">Pattern</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-300">
                                <td className="border p-2 break-all min-w-40">{item.name}</td>
                                <td className="border p-2 break-all min-w-40">{item.derivatives.join(", ")}</td>
                                <td className="border p-2 break-all">{item.pattern}</td>
                                <td className="border p-2 space-x-2 whitespace-nowrap w-fit">
                                    { (item.derivatives.length) ? 
                                        <button onClick={() => onModify(item)} className="bg-gray-500 text-white px-2 py-1 rounded shadow transition-colors duration-300" disabled>
                                            Modify
                                        </button>
                                        :
                                        <button onClick={() => onModify(item)} className="bg-yellow-500 text-white px-2 py-1 rounded shadow hover:bg-yellow-600 transition-colors duration-300">
                                            Modify
                                        </button>
                                    }
                                    <button onClick={() => onDelete(item)} className="bg-red-500 text-white px-2 py-1 rounded shadow hover:bg-red-600 transition-colors duration-300">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!filteredData.length && (
                            <tr>
                                <td colSpan={4} className="border p-2 text-center">No item found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Lookups = ({
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
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/field?option=raw");
                setData(response.data);
            } catch (error) {
                showServerResponse(error?.response || error);
            } finally {
                setIsLoading(false);
            }
        };

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
    };

    const handleModify = (item) => {
        setFormData(item);
        setFormModalIsOpen(true);
        setActionType("modify");
    };

    const handleMerge = (item) => {
        setFormData(null);
        setFormModalIsOpen(true);
        setActionType("merge");
    };

    const handleDelete = (item) => {
        setFormData(item);
        setFormModalIsOpen(true);
        setActionType("delete");
    };

    const handleSubmitDelete = async (item) => {
        let id = item._id;

        try {
            setIsLoading(true);
            const response = await axios.delete("/field", {
                data: [{ _id: id }],
            });
            showServerResponse(response);
            // Reload data
            const updatedData = await axios.get("/field?option=raw");
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
            const response = await axios.post("/field", [item]);
            showServerResponse(response);
            // Reload data
            const updatedData = await axios.get("/field?option=raw");
            setData(updatedData.data);
        } catch (error) {
            showServerResponse(error?.response || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classNames(className)} {...props}>
            <Table className="container mx-auto p-4"
                data={data}
                search={search}
                onSearch={handleSearch}
                onModify={handleModify}
                onDelete={handleDelete}
                onCreate={handleCreate}
                onMerge={handleMerge}
            />
            <Modal
                title={actionType}
                isOpen={formModalIsOpen}
                onRequestClose={() => setFormModalIsOpen(false)}
            >
                <Form
                    initialData={formData}
                    formType={"field"}
                    onSubmit={actionType == "delete" ? handleSubmitDelete : handleSubmit}
                    initialSubmitMode={actionType == "delete" ? "confirmation" : undefined}
                    onRequestClose={() => setFormModalIsOpen(false)}
                >
                    
                    {["create", "modify", "merge"].includes(actionType) && (
                        <>
                        <Label label="Name" />
                        <Input name="name" />
                        </>
                    )}

                    {["create", "modify"].includes(actionType) && (
                        <>
                        <Label label="Pattern" />
                        <Input name="pattern" />
                        </>
                    )}

                    {["merge"].includes(actionType) && (
                        <>
                        <Label label="Macro" />
                        <Input name="pattern" />
                        <Label label="Derivatives" />
                        <Input name="derivatives" />
                        </>
                    )}
                    
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
    );
};

export default Lookups;
