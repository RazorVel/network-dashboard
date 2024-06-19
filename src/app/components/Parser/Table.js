import React from "react";
import classNames from "classnames";
import FormInput from "../Form/Input.js";
import { Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";

const ParserTable = ({
    className,
    data,
    search,
    onSearch,
    onModify,
    onDelete,
    onCreate,
    ...props
}) => {

    const filteredData = data.filter((item) => 
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.lookups.join(", ").toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(item.jobs).includes(search.toLowerCase())
    );

    filteredData.sort((x, y) => x.type.toLowerCase() <= y.type.toLowerCase() ? -1 : 1);

    return (
        <div className={classNames("space-y-4", className)} {...props}>
            <div className="flex justify-end mb-4 gap-5">
                <button onClick={onCreate} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Create</button>
                <FormInput
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
                            <th className="border p-2">Type</th>
                            <th className="border p-2">Lookups</th>
                            <th className="border p-2">Jobs</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-300">
                                <td className="border p-2 break-all min-w-32">{item.type}</td>
                                <td className="border p-2 break-all min-w-40">{item.lookups.join(", ")}</td>
                                <td className="border p-2 break-all">
                                    <SyntaxHighlighter className="max-h-64" language="javascript" style={coy} wrapLongLines={true} customStyle={{backgroundColor: "transparent"}}>
                                        {JSON.stringify(item.jobs, null, 4)}
                                    </SyntaxHighlighter>
                                </td>
                                <td className="border p-2 space-x-2 whitespace-nowrap w-fit">
                                    <button onClick={() => onModify(item)} className="bg-yellow-500 text-white px-2 py-1 rounded shadow hover:bg-yellow-600 transition-colors duration-300">
                                        Modify
                                    </button>
                                    <button onClick={() => onDelete(item._id)} className="bg-red-500 text-white px-2 py-1 rounded shadow hover:bg-red-600 transition-colors duration-300">
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
}

export default ParserTable;