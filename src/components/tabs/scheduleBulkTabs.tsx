// ImportTabs-ImportSchedule.tsx
import React from "react";
import ScheduleTable from "../tables/scheduleTableBulk";

interface ImportTabsProps {
    data: any;
    selected: "to_import" | "already_imported"
    onSelect: (val: any) => void;
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
}) => {
    const titles: any = {
        to_import: "To Import",
        already_imported: "Already Imported",
    };

    return (
        <div className="relative mt-5">
            {/* Tabs */}
            <div className="-mb-2 ml-4 flex space-x-2 z-0">
                {Object.keys(titles).map((cat) => {
                    const isActive = selected === cat;
                    const activeBg = "bg-blue-600 border-blue-600 text-white";
                    const inactiveBg =
                        "bg-white border-blue-600 border-2 text-blue-600";

                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`px-4 py-2 rounded-t-md text-sm font-medium border transition ${
                                isActive ? activeBg : inactiveBg
                            }`}
                        >
                            {titles[cat]} ({data[cat]?.length || 0})
                        </button>
                    );
                })}
            </div>

            {/* Table Container */}
            {/* Table Container */}
            <div className="bg-white p-4 rounded-lg shadow-md border-2 border-blue-600 z-10 relative">
                {data[selected]?.length > 0 ? (
                    <ScheduleTable
                        key={selected} // remount on tab switch
                        data={[...data[selected]]} // shallow copy
                    />
                ) : (
                    <p className="text-center text-gray-500 py-6">
                        No schedules found in this category.
                    </p>
                )}

                {/* Save Button */}
                {selected === "to_import" && data.to_import?.length > 0 && (
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
