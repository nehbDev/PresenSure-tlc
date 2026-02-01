import React from "react";

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex: string;
  program?: string;
  year_level?: string;
  block?: string;
  [key: string]: any;
}

interface StudentsTableSelectableProps {
  data: Student[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}


const studentTablebulkRemove: React.FC<StudentsTableSelectableProps> = ({
  data,
  selectedIds,
  onToggleSelect,
  onToggleAll,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        No students found.
      </div>
    );
  }

  // Check if every currently visible row is selected
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(row.user_id));

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="w-4 h-4 text-red-600 rounded bg-white border-transparent focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase">ID</th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase">Full Name</th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase">Sex</th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase">Program</th>
              <th className="px-3 py-3 text-center text-sm font-bold uppercase">Block</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isSelected = selectedIds.includes(row.user_id);
              return (
                <tr
                  key={row.user_id}
                  className={`${
                    isSelected ? "bg-red-50" : idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-red-50 border-b border-gray-200 last:border-b-0 transition-colors`}
                >
                  <td className="px-4 py-3 text-center border-r border-gray-100">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(row.user_id)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-700">{row.user_id}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">
                    {row.lastname}, {row.firstname}
                    {row.suffix ? ` ${row.suffix}` : ""}
                    {row.middle_initial ? ` ${row.middle_initial}.` : ""}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">{row.sex || "N/A"}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{row.program || "N/A"}</td>
                  <td className="px-3 py-3 text-sm text-center text-gray-600">
                    {row.block || "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default studentTablebulkRemove;