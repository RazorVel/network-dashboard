import React, { useContext, useState, useEffect } from "react";
import classNames from "classnames";
import { AppContext } from "../../context.js";
import Modal from "../Media/Modal.js";
import {Input} from "../Media/Form.js";
import {BsRegex as Regex} from "react-icons/bs";
import {VscCaseSensitive as CaseSensitive} from "react-icons/vsc";
import {RiArrowLeftSLine as ArrowLeft, RiArrowRightSLine as ArrowRight} from "react-icons/ri";

const LogStack = ({
    className,
    ...props
}) => {
    const { logCache, isStreamPaused } = useContext(AppContext);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageLength, setPageLength] = useState(100);
    const [focus, setFocus] = useState(null);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [searchUseRegex, setSearchUseRegex] = useState(false);
    const [searchCaseSensitive, setSearchCaseSensitive] = useState(false);
    const [searchString, setSearchString] = useState("");
    const [filteredLog, setFilteredLog] = useState(logCache);
    const [isValidRegex, setIsValidRegex] = useState(true);

    const handleOnSearch = (event) => {
        setPageNumber(1);
        setIsValidRegex(true);
        setSearchString(event.target.value);
    }

    const getFilteredLog = () => {
        const propertySearchPattern = /([\w_]+):(["'])(.*?[^\\])\2/g;
        const propertyFilters = [];
        let generalSearchTerm = '';
        let lastIndex = 0;
    
        // Extract property-based filters
        let match;
        while ((match = propertySearchPattern.exec(searchString)) !== null) {
            const property = match[1];
            const value = match[3].replace(/\\"/g, '"').replace(/\\'/g, "'");
            let filterValue;
    
            try {
                filterValue = searchUseRegex ? new RegExp(value, searchCaseSensitive ? undefined : 'i') : value;
            } catch (e) {
                setIsValidRegex(false);
                return logCache;
            }
    
            propertyFilters.push({ property, value: filterValue });
            lastIndex = propertySearchPattern.lastIndex;
        }
    
        // Extract the general search term starting after the last property filter
        if (lastIndex < searchString.length) {
            generalSearchTerm = searchString.slice(lastIndex).trim();
        }
    
        let generalSearchPattern;
        try {
            generalSearchPattern = searchUseRegex ? new RegExp(generalSearchTerm, searchCaseSensitive ? undefined : 'i') : generalSearchTerm;
        } catch (e) {
            setIsValidRegex(false);
            return logCache;
        }
    
        return logCache.filter((item) => {
            let log = item._log;
            let isMatch = true;
    
            // Apply property-based filters
            for (const filter of propertyFilters) {
                if (item[filter.property]) {
                    let itemValue = item[filter.property].toString();
                    if (!searchCaseSensitive && !searchUseRegex) {
                        itemValue = itemValue.toLowerCase();
                    }
                    if (searchUseRegex) {
                        try {
                            if (!filter.value.test(itemValue)) {
                                isMatch = false;
                                break;
                            }
                        } catch (e) {
                            setIsValidRegex(false);
                            return false;
                        }
                    } else {
                        if (!searchCaseSensitive) {
                            filter.value = filter.value.toLowerCase();
                        }

                        if (!itemValue.includes(filter.value)) {
                            isMatch = false;
                            break;
                        }
                    }
                } else {
                    isMatch = false;
                    break;
                }
            }
    
            if (!isMatch) {
                return false;
            }
    
            // Apply general search term
            if (generalSearchTerm) {
                if (!searchCaseSensitive) {
                    log = log.toLowerCase();
                }
    
                if (searchUseRegex) {
                    try {
                        return generalSearchPattern.test(log);
                    } catch (e) {
                        setIsValidRegex(false);
                        return false;
                    }
                } else {
                    if (!searchCaseSensitive) {
                        generalSearchTerm = generalSearchTerm.toLowerCase();
                    }
                    return log.includes(generalSearchTerm);
                }
            }
    
            return true;
        });
    };    

    useEffect(() => {
        setFilteredLog(getFilteredLog());
    }, [logCache, searchString, searchCaseSensitive, searchUseRegex]);

    return (
        <div className={classNames("bg-white rounded overflow-auto", className)} {...props}>
            <div className="w-full h-fit max-h-full overflow-auto">
                <div className="sticky top-0 left-0 flex p-2 bg-white overflow-hidden z-[7]">
                    <div className="flex gap-3 items-center px-2">
                        <ArrowLeft 
                            className="h-14 w-fit py-2"
                            title="previous" 
                            onClick={() => setPageNumber(number => Math.max(number - 1, 1))}
                        />
                        <p className="text-xl">{pageNumber}</p>
                        <ArrowRight 
                            className="h-14 w-fit py-2" 
                            title="next"
                            onClick={() => setPageNumber(number => Math.min(number + 1, Math.floor(filteredLog.length / pageLength) + 1))}
                        />
                    </div>

                    <Input 
                        className="h-14 w-full rounded flex-[1]" 
                        placeholder={"[PROPERTY:(\"VALUE WITH \\\"SPACES\\\"\"|'VALUE WITH \\'ESCAPES\\')...] GENERAL SEARCH TERM"} 
                        onChange={handleOnSearch}
                    />
                    <CaseSensitive 
                        className={classNames(
                            "h-14 w-fit transition-all ease-in-out pl-3 pr-1 py-2 focus:outline-none duration-300 hover:scale-[1.2]",
                            (searchCaseSensitive) ? "text-black font-bold" : "text-gray-300"
                            )}
                        onClick={() => {setSearchCaseSensitive((prev) => !prev)}}
                        title="Case Sensitive"
                    />
                    <Regex 
                        className={classNames(
                            "h-14 w-fit transition-all ease-in-out px-1 py-2 focus:outline-none duration-300 hover:scale-[1.2]",
                            (searchUseRegex) ? "text-black font-bold" : "text-gray-300"
                        )}
                        onClick={() => {setSearchUseRegex((prev) => !prev)}}
                        title="Regular Expression"
                    />
                </div>
                { searchUseRegex && !isValidRegex && (
                    <p className="text-red-700 text-sm">Invalid regular expression as search string!</p>
                )}
                <table 
                    className="rounded border-t-2 w-full overflow-auto"
                ><tbody>
                {filteredLog.slice((pageNumber - 1) * pageLength, pageNumber * pageLength).map((log, index) => (
                     <tr key={index}>
                        <td className="text-blue-900 pr-2 border-r-2 border-gray-300">{filteredLog.length - index - pageLength * (pageNumber - 1)}</td>
                        <td 
                            className={classNames(
                                "px-4 py-2 cursor-pointer",
                                "transition-all ease-in-out hover:scale-[1.005]",
                                index % 2 === 0 ? "bg-blue-100" : "bg-blue-50",
                                "whitespace-nowrap tracking-white"
                            )}
                            onClick={() => {
                                setFocus(log);
                                setIsFocusModalOpen(true);
                            }}
                        >
                            {log._log}
                        </td>
                    </tr>
                ))}
                </tbody></table>
            </div>

            <Modal
                title={focus ? focus._log : undefined}
                isOpen={isFocusModalOpen}
                onRequestClose={() => {
                    setFocus(null);
                    setIsFocusModalOpen(false);
                }}
            >
                {focus && (
                    <table className="text-wrap"><tbody>
                        { Object.getOwnPropertyNames(focus).map((property, index) => {
                            if (["_id", "_log", "_isActive", "_timestamp"].includes(property)) {
                                return (<></>);
                            }

                            let value = focus[property];

                            if (property == "others") {
                                value = value.toString();
                            }

                            return (
                                <tr key={index} className={classNames(index % 2 == 0 ? "bg-gray-100" : "")}>
                                    <td className="pr-3 border-r-2 border-gray-300"><b>{property}</b></td>
                                    <td className="pl-3 break-all">{value}</td>
                                </tr>
                            )
                        })}
                    </tbody></table>
                )}
            </Modal>
        </div>
    );
}

export default LogStack;