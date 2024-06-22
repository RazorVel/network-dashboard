import React, { useContext, useState, useEffect } from "react";
import classNames from "classnames";
import { AppContext } from "../../context.js";
import Modal from "../Media/Modal.js";
import {Input} from "../Media/Form.js";
import {BsRegex as Regex} from "react-icons/bs";
import {VscCaseSensitive as CaseSensitive} from "react-icons/vsc";

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
    const [isValidRegex, setIsValidRegex] = useState(false);

    const handleOnSearch = (event) => {
        setSearchString(event.target.value);
    }

    const getFilteredLog = () => {
        try {
            return logCache.filter((item) => {
                let log = item._log;
                let pattern = searchString;

                if (!pattern) {
                    return true;
                }

                if (!searchCaseSensitive) {
                    log = log.toLowerCase();
                }

                if (searchUseRegex) {
                    pattern = new RegExp(pattern, searchCaseSensitive ? undefined : 'i');
                } else if (!searchCaseSensitive) {
                    pattern = pattern.toLowerCase();
                }

                return searchUseRegex ? log.search(pattern) >= 0 : log.includes(pattern);
            });
        } catch (e) {
            setIsValidRegex(false);
            return logCache;
        }
    };

    useEffect(() => {
        setFilteredLog(getFilteredLog());
    }, [logCache, searchString, searchCaseSensitive, searchUseRegex]);

    return (
        <div className={classNames("bg-white rounded overflow-auto", className)} {...props}>
            <div className="w-full h-fit max-h-full overflow-auto">
                <div className="sticky top-0 left-0 flex p-2 bg-white overflow-hidden z-[7]">
                    <Input className="h-14 w-full rounded flex-[1]" placeholder="Search..." onChange={handleOnSearch}/>
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
                <p></p>
                <table className="rounded border-t-2 w-full overflow-auto"><tbody>
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
                        { Object.getOwnPropertyNames(focus).map((property, index) => (
                            <tr key={index} className={classNames(index % 2 == 0 ? "bg-gray-100" : "")}>
                                <td className="pr-3 border-r-2 border-gray-300"><b>{property}</b></td>
                                <td className="pl-3 break-all">{focus[property]}</td>
                            </tr>
                        ))}
                    </tbody></table>
                )}
            </Modal>
        </div>
    );
}

export default LogStack;