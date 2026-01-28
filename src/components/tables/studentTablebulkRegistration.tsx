import React from "react";

interface StudentsTableProps {
  data: Array<{
    id: string;
    firstname: string;
    middle_initial: string;
    lastname: string;
    suffix?: string;
    sex: string;
    program?: string;
    year_level?: string;
    block?: string;
    [key: string]: any;
  }>;
  onRemoveRow?: (id: string, index: number) => void;
  category?: string;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ 
  data, 
  onRemoveRow, 
  category = "default"
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-3 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                ID
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                Full Name
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                Sex
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                Program
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                Year Level
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                Block
              </th>
              {onRemoveRow && (
                <th className="px-3 py-3 text-center text-sm font-bold uppercase first:rounded-tl-lg last:rounded-tr-lg">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={`${category}-${row.id}-${idx}`}
                className={`${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 border-b border-gray-200 last:border-b-0`}
              >
                <td className="px-3 py-3 text-sm font-mono">
                  {row.id}
                </td>
                <td className="px-3 py-3 text-sm">
                  {row.lastname}, {row.firstname}
                  {row.suffix ? ` ${row.suffix}` : ""}
                  {row.middle_initial ? ` ${row.middle_initial}` : ""}
                </td>
                <td className="px-3 py-3 text-sm">
                  {row.sex || "N/A"}
                </td>
                <td className="px-3 py-3 text-sm">
                  {row.program || "N/A"}
                </td>
                <td className="px-3 py-3 text-sm">
                  {row.year_level || "N/A"}
                </td>
                <td className="px-3 py-3 text-sm text-center">
                  {row.block || "N/A"}
                </td>
                {onRemoveRow && (
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(row.id, idx)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;