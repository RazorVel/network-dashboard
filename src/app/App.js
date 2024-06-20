import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PiSunHorizonDuotone as Sun, PiMoonStarsBold as Moon } from "react-icons/pi";
import classNames from "classnames";
import Navigation from "./components/Widget/Navigation.js";
import FieldLookups from "./views/Field/Lookups.js";
import ParserLookups from "./views/Parser/Lookups.js";
import Dashboard from "./views/Dashboard.js";
import NotFound from "./views/NotFound.js";
import TopBar from "./components/Widget/TopBar.js";
import {AppContext} from "./context.js";
import ReactLoading from "react-loading";

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

    return (
        <AppContext.Provider value={{isLoading, setIsLoading}}>
        <Router>
            <div className={classNames(className)} {...props}>
                <TopBar className="sticky z-10 top-0"/>
                <div className="flex h-full w-full fixed top-8 bottom-0 overflow-y-scroll">
                    <Navigation className="sticky top-0"/>
                    <Routes>
                        <Route path="/client/" element={<Dashboard className="flex-[1]"/>} />
                        <Route path="/client/field" element={<FieldLookups className="flex-[1]"/>} />
                        <Route path="/client/parser" element={<ParserLookups className="flex-[1]"/>} />
                        <Route path="/client/*" element={<NotFound className="flex-[1]"/>} />
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