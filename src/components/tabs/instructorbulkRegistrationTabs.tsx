import React from "react";
import InstructorsTable from "../tables/instructorsTablebulkRegistration";

interface ImportTabsProps {
  data: {
    already_registered: any[];
    to_register: any[];
  };
  selected: "to_register" | "already_registered";
  onSelect: (val: "to_register" | "already_registered") => void;
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
      to_register: "To Register",
      already_registered: "Already Registered",
    };
    return titles[cat] || "";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-5 border-b border-gray-300 text-sm mb-2">
        {["to_register", "already_registered"].map((cat) => {
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat as "to_register" | "already_registered")}
              className={`relative px-4 py-2 font-semibold transition ${
                isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
              }`}
            >
              {getCategoryTitle(cat)} ({data[cat as keyof typeof data]?.length || 0})
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      {data[selected]?.length > 0 ? (
        <InstructorsTable data={data[selected]} onRemoveRow={onRemoveRow} />
      ) : (
        <div className="text-center py-4 text-gray-500 text-xs">
          No instructors found in this category.
        </div>
      )}

      {/* Action Bar for Save */}
      {selected === "to_register" && data.to_register.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 text-white rounded-md font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save to Database"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportTabs;
