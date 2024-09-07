import { AppContext } from "../context.js";
import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames";
import Modal from "../components/Media/Modal.js";
import {Form, Input, Label, Select} from "../components/Media/Form.js";
import DynamicLayout from "../components/Media/DynamicLayout.js";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import LogStack from "../components/Widget/LogStack.js";
import Controls from "../components/Widget/Controls.js";
import ProportionalChart from "../components/Widget/ProportionalChart.js";
import {v4 as uuidv4} from "uuid";
import { extractMarkdownSections } from "../../utils/mdHelper.js";
import { Markdown } from "../components/Media/Markdown.js";

//The Graduation Ticket -FH
const Dashboard = ({
    className,
    ...props
}) => {
    const defaultLayoutConfig = [
        { type: "Controls", i: uuidv4(), x: 0, y: 0, w: 20, h: 2, isResizable: false, isDraggable: false },
        { type: "LogStack", i: uuidv4(), x: 0, y: 0, w: 20, h: 10 }
    ];
    
    const { setIsLoading, logCache, documentation } = useContext(AppContext);
    const [layoutConfig, setLayoutConfig] = useState([]);
    const [updatedConfig, setUpdatedConfig] = useState([]);
    
    const [isStreamPaused, setIsStreamPaused] = useState(false);
    const [responseModalIsOpen, setResponseModalIsOpen] = useState(false);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseDetail, setResponseDetail] = useState(null);
    
    const [createWidgetModalIsOpen, setCreateWidgetModalIsOpen] = useState(false);

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
    };
    
    const handleReset = () => {
        setLayoutConfig(defaultLayoutConfig);
        setUpdatedConfig(defaultLayoutConfig);
        localStorage.setItem("layoutConfig", JSON.stringify(defaultLayoutConfig));
        alert("Layout reset!");
    };

    const handleCreateChart = function (formData) {
        let grid = {
            type: "ProportionalChart", 
            i: uuidv4(), 
            x: 0,
            y: 10e10, 
            w: 5, 
            h: 10,
            ...formData
        }

        updatedConfig.push(grid);
        layoutConfig.push(grid);

        setCreateWidgetModalIsOpen(false);
    }

    const renderComponent = (item) => {
        switch (item.type) {
            case 'Controls':
                return <Controls onSave={handleSave} onReset={handleReset} onCreateProportionalChart={() => setCreateWidgetModalIsOpen(true)} className="w-full h-full" />;
            case 'LogStack':
                return <LogStack className="w-full h-full p-2" />;
            case "ProportionalChart":
                return <ProportionalChart 
                    className="w-full h-full p-2" 
                    {...item}
                    data={logCache}
                    categories={item["aggregate-fields"]?.split(/,\s*/).filter(x => x != "") || ""}
                />;
            default:
                return <></>;
        }
    };

    const onLayoutChange = (layouts) => {        
        // Merge the existing layoutConfig with the new layout positions
        console.log(updatedConfig, layouts);
        const updatedLayouts = layouts.map((layout) => {
            const existingLayout = updatedConfig.find((item) => item.i.toString().replace(/^(\.\$)*/g, "") === layout.i.replace(/^(\.\$)*/g, ""));
            return {...existingLayout, ...layout};
        });
        setUpdatedConfig(updatedLayouts);
    };

    const deleteGrid = (id) => {
        setLayoutConfig(layoutConfig.filter(item => item.i !== id));
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
        <div className={classNames("min-h-[200%]", className)} {...props}>
            <DynamicLayout cols={20} rowHeight={30} onLayoutChange={onLayoutChange}>
                {layoutConfig && layoutConfig.map((item, i) => (
                    <div key={item.i} className="w-full h-full flex items-center justify-center" data-grid={{...item}}>
                        {renderComponent(item)}
                        {item.type == "ProportionalChart" && (
                            <button
                                onClick={() => deleteGrid(item.i)}
                                className="absolute top-1 right-4 text-3xl text-gray-500 hover:text-gray-700 transition-colors duration-300"
                            >
                                ×
                            </button>
                        )}
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

            <Modal
                title={"Create Chart"}
                isOpen={createWidgetModalIsOpen}
                secondary={true}
                onRequestClose={() => setCreateWidgetModalIsOpen(false)}
            >
                <Form
                    initialSubmitMode="confirmation"
                    onSubmit={handleCreateChart}
                    onRequestClose={() => setCreateWidgetModalIsOpen(false)}
                >
                    <Label label="Type of chart"/>
                    <Select
                        name="model"
                        value=""
                        options={[
                            ["pie", "Pie"],
                            ["doughnut", "Doughnut"],
                            ["polar area", "Polar Area"],
                            ["pareto", "Pareto"],
                            ["bar", "Bar"],
                            ["line", "Line"],
                            ["radar", "Radar"]
                        ]}
                    />
                    <Label label="Label"/>
                    <Input
                        type="text"
                        name="label"
                    />
                    <Label label="Aggregate field(s)"/>
                    <Input
                        type="text"
                        placeholder="field[, field]..."
                        name="aggregate-fields"
                    />
                    <Label label="Top"/>
                    <Input
                        type="number"
                        min={0}
                        placeholder="show top n data as verbose, 0 for infinite..."
                        name="top"
                        value={0}
                    />
                    <Label label="Sort by"/>
                    <Select
                        placeholder="Mode..."
                        name="sortMode"
                        value=""
                        options={[
                            ["label", "Label"],
                            ["quantity", "Quantity"]
                        ]}
                    />
                    <Label label="Visual arrangement"/>
                    <Select 
                        placeholder="Order by..."
                        name="order"
                        value=""
                        options={[
                            ["ascending", "Ascending"],
                            ["descending", "Descending"]
                        ]}
                    />
                </Form>

                <Markdown document={extractMarkdownSections(documentation, "Data Visualization", "Product Demo Video")}/>
            </Modal>
        </div>
    )

}

export default Dashboard;