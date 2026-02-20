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
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Overflow wrapper for horizontal scrolling */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-3 text-left text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                Full Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                Sex
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                Program
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                Year Level
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                Block
              </th>
              {onRemoveRow && (
                <th className="px-4 py-3 text-center text-sm font-bold uppercase whitespace-nowrap tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr 
                key={`${category}-${row.id}-${idx}`}
                className={`${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors duration-150`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap font-mono">
                  {row.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {row.lastname}, {row.firstname}
                  {row.suffix ? ` ${row.suffix}` : ""}
                  {row.middle_initial ? ` ${row.middle_initial}` : ""}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {row.sex || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {row.program || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {row.year_level || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                  {row.block || "N/A"}
                </td>
                {onRemoveRow && (
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(row.id, idx)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-1 text-xs font-medium transition-colors duration-200 shadow-sm"
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