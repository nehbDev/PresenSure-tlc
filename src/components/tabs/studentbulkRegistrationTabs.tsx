import React from "react";
import StudentsTable from "../tables/studentTablebulkRegistration";

interface ImportTabsProps {
  data: {
    already_enrolled: any[];
    to_enroll: any[];
  };
  selected: "to_enroll" | "already_enrolled";
  onSelect: (val: "to_enroll" | "already_enrolled") => void;
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
    };
    return titles[cat] || "";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-5 border-b border-gray-300 text-sm mb-2">
        {["to_enroll", "already_enrolled"].map((cat) => {
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat as "to_enroll" | "already_enrolled")}
              className={`relative px-4 py-2 font-semibold transition ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              {getCategoryTitle(cat)} (
                {data[cat as keyof typeof data]?.length || 0}
              )
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      {data[selected]?.length > 0 ? (
        <StudentsTable 
          data={data[selected]} 
          onRemoveRow={onRemoveRow}
          category={selected} // Add this prop to make keys unique
        />
      ) : (
        <div className="text-center py-4 text-gray-500 text-xs">
          No users found in this category.
        </div>
      )}

      {/* Action Bar for Save */}
      {selected === "to_enroll" && data.to_enroll.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded-md font-medium text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSaving ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportTabs;