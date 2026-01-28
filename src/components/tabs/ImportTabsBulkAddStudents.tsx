import React from "react";
import StudentsTable from "../tables/StudentsTableBulkAddStudents";

interface ImportTabsProps {
    data: {
        already_enrolled: any[];
        to_enroll: any[];
        invalid: any[];
    };
    selected: "to_enroll" | "already_enrolled" | "invalid";
    onSelect: (val: "to_enroll" | "already_enrolled" | "invalid") => void;
    onSave: () => void;
    isSaving: boolean;
    onRemoveRow?: (id: string, index: number) => void;
}

const ImportTabs: React.FC<ImportTabsProps> = ({
    data,
    selected,
    onSelect,
    onSave,
    isSaving,
    onRemoveRow,
}) => {
    const getCategoryTitle = (cat: string) => {
        const titles: { [key: string]: string } = {
            to_enroll: "To Enroll",
            already_enrolled: "Already Enrolled",
            invalid: "Invalid",
        };
        return titles[cat] || "";
    };

    const renderInvalidTable = () => {
        return (
            <table className="w-full border text-black">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">#</th>
                        <th className="border px-2 py-1">Student ID</th>
                        <th className="border px-2 py-1">Full Name</th>
                        <th className="border px-2 py-1">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {data.invalid.map((item, index) => (
                        <tr key={index}>
                            <td className="border px-2 py-1">{index + 1}</td>
                            <td className="border px-2 py-1">{item.student_id || "N/A"}</td>
                            <td className="border px-2 py-1">{item.fullname}</td>
                            <td className="border px-2 py-1 text-red-500">{item.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="relative mt-5">
            {/* Tabs */}
            <div className="-mb-2 ml-4 z-0 flex space-x-2 relative">
                {["to_enroll", "already_enrolled", "invalid"].map((cat) => {
                    const isActive = selected === cat;
                    const activeBg = "bg-blue-600 border-blue-600 text-white";
                    const inactiveBg =
                        "bg-white border-blue-600 border-2 text-blue-600";

                    return (
                        <button
                            key={cat}
                            onClick={() =>
                                onSelect(cat as "to_enroll" | "already_enrolled" | "invalid")
                            }
                            className={`px-4 py-2 rounded-t-md text-sm font-medium border transition ${
                                isActive ? activeBg : inactiveBg
                            }`}
                        >
                            {getCategoryTitle(cat)} (
                            {data[cat as keyof typeof data]?.length || 0})
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div
                className={`bg-white p-4 rounded-lg shadow-md z-10 relative border-blue-600 border-2`}
            >
                {data[selected]?.length > 0 ? (
                    selected === "invalid" ? (
                        renderInvalidTable()
                    ) : (
                        <StudentsTable
                            key={selected}
                            data={[...data[selected]]}
                            onRemoveRow={selected === "to_enroll" ? onRemoveRow : undefined}
                        />
                    )
                ) : (
                    <p className="text-center text-gray-500 py-6">
                        No students found in this category.
                    </p>
                )}

                {selected === "to_enroll" && data.to_enroll?.length > 0 && (
                    <div className="text-center mt-4">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            {isSaving ? "Saving..." : "Save to Database"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportTabs;