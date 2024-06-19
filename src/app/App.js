import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PiSunHorizonDuotone as Sun, PiMoonStarsBold as Moon } from "react-icons/pi";

import classNames from "classnames";
import Navigation from "./components/Widget/Navigation.js";
import FieldLookups from "./views/Field/Lookups.js";
import ParserLookups from "./views/Parser/Lookups.js";
import Dashboard from "./views/Dashboard.js";
import NotFound from "./views/NotFound.js";
import TopBar from "./components/Widget/TopBar.js";

const App = ({
    className,
    page,
    ...props
}) => (
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
        </div>
    </Router>
)

export default App;