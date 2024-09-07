import {AppContext} from "./context.js";
import React, {useEffect, useState, useRef} from "react";
import ReactLoading from "react-loading";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import classNames from "classnames";
import axios from "axios";
import Navigation from "./components/Widget/Navigation.js";
import FieldLookups from "./views/FieldConfig.js";
import ParserLookups from "./views/ParserConfig.js";
import Dashboard from "./views/Dashboard.js";
import NotFound from "./views/NotFound.js";
import Documentation from "./views/Documentation.js";
import TopBar from "./components/Widget/TopBar.js";

const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
}

const App = ({
    className,
    page,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [logCache, setLogCache] = useState([]);
    const [documentation, setDocumentation] = useState("");
    const [isStreamPaused, setIsStreamPaused] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        const fetchDocumentation = async() => {
            try {
                setIsLoading(true);
                const response = await axios.get("/client/README.md");
                setDocumentation(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDocumentation();
    }, []);
    
    useEffect(() => {
        const createEventSource = () => {
            console.log("Connecting SSE...");
            let eventSource = new EventSource("/sse");
            let previousLogCache = logCache;
            setLogCache([]);
    
            eventSource.onmessage = (event) => {
                try{
                    const data = JSON.parse(event.data);
                    
                    if (!(data instanceof Array)){
                        throw new Error("Log cache is of type", typeof data, "(Expected Array)");
                    } 
    
                    setLogCache((logCache) => data.concat(logCache));
                } catch (err) {
                    console.error(err);
                }
            }
    
            eventSource.onerror = (err) => {
                setLogCache(previousLogCache);
                console.error("EventSource failed:", err);

                if (eventSource.readyState === EventSource.CONNECTING) {
                    console.log("Reconnecting SSE...");
                }
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log("Reinitializing SSE...");
                    eventSource.close();
                    setTimeout(createEventSource, 3000);
                }
            }

            eventSourceRef.current = eventSource;
        }


        if (!isStreamPaused) {
            createEventSource();
        } else if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        }
    }, [isStreamPaused]);

    return (
        <AppContext.Provider value={{isLoading, setIsLoading, logCache, setLogCache, documentation, setDocumentation, isStreamPaused, setIsStreamPaused}}>
        <Router>
            <div className={classNames(className)} {...props}>
                <TopBar className="sticky z-10 top-0"/>
                <div className="flex h-full w-full fixed top-8 bottom-0 overflow-y-scroll">
                    <Navigation className="sticky top-0"/>
                    <Routes>
                        <Route path="/client/" element={<Dashboard className="flex-[1] pb-8 h-fit"/>} />
                        <Route path="/client/field" element={<FieldLookups className="flex-[1] pb-8 h-fit"/>} />
                        <Route path="/client/parser" element={<ParserLookups className="flex-[1] pb-8 h-fit"/>} />
                        <Route path="/client/documentation" element={<Documentation className="flex-[1] pb-8 h-fit"/>} />
                        <Route path="/client/*" element={<NotFound className="flex-[1] pb-8 h-fit"/>} />
                    </Routes>
                </div>

                {isLoading && (
                    <>
                    <ReactLoading.default type="cylon" color="#55aaffaa" height="10%" width="10%" className="h-1/6 w-1/6 left-1/2 top-1/2 absolute transform translate-x-[-50%] translate-y-[-50%] z-[9]"/>
                    <div className="fixed top-0 bottom-0 left-0 right-0 backdrop-blur-sm z-[8]"></div>
                    </>
                )}
            </div>
        </Router>
        </AppContext.Provider> 
    )
}

export default App;