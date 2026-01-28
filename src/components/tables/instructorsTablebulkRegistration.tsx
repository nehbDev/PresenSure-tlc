import React from "react";

interface InstructorsTableProps {
  data: Array<{
    user_id: string;
    firstname: string;
    middle_initial: string;
    lastname: string;
    suffix?: string;
    sex: string;
    department?: string;
    specialization?: string;
    [key: string]: any;
  }>;
  onRemoveRow?: (id: string, index: number) => void;
  category?: string;
}

const InstructorsTable: React.FC<InstructorsTableProps> = ({ 
  data,  
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
              <th className="px-4 py-3 text-left text-sm font-bold uppercase first:rounded-tl-lg w-1/4">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase w-1/4">
                Full Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase w-1/4">
                Sex
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold uppercase last:rounded-tr-lg w-1/4">
                Department
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={`${category}-${row.user_id}-${idx}`}
                className={`${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 border-b border-gray-200 last:border-b-0`}
              >
                <td className="px-4 py-3 text-sm font-mono whitespace-nowrap w-1/4">
                  {row.user_id}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap w-1/4">
                  {row.lastname}, {row.firstname}
                  {row.suffix ? ` ${row.suffix}` : ""}
                  {row.middle_initial ? ` ${row.middle_initial}` : ""}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap w-1/4">
                  {row.sex || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap w-1/4">
                  {row.department || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorsTable;