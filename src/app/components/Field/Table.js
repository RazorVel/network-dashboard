import React from "react";
import FormInput from "../Form/Input.js";

const FieldTable = ({
    data,
    search,
    onSearch,
    onModify,
    onDelete,
    onCreate,
    onMerge,
}) => {
    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.derivatives.join(", ").toLowerCase().includes(search.toLowerCase()) ||
        item.pattern.toLowerCase().includes(search.toLowerCase())
    );

    filteredData.sort((x, y) => x.name.toLowerCase() <= y.name.toLowerCase() ? -1 : 1);

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4 gap-5">
                <button onClick={onMerge} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors duration-300">Merge</button>
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
};

export default FieldTable;
