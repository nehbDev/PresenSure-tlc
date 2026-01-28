import React from "react";

// --- Constants for Column Widths ---
const ID_COL_WIDTH = "120px";
const NAME_COL_WIDTH = "200px";

interface Student {
  id: number;
  student_id: string;
  name: string;
  sex: "male" | "female";
}

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "early_out"
  | "unknown";

interface AttendanceRecord {
  date: string;
  period: "prelim" | "midterm" | "prefinals" | "finals";
  schedule_type: "regular" | "makeup" | "special";
  attendance: {
    [studentId: number]: AttendanceStatus;
  };
}

interface Props {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

const FixedColumnAttendanceTable: React.FC<Props> = ({
  students,
  attendanceRecords,
}) => {
  const formatName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 0) return fullName;
    const firstName = parts[0];
    const middle =
      parts.length > 2 ? parts.slice(1, parts.length - 1).join(" ") : "";
    const lastName = parts[parts.length - 1];
    return `${lastName}, ${firstName}${middle ? " " + middle : ""}`;
  };

  const groupedStudents = React.useMemo(() => {
    const males = students
      .filter((s) => s.sex === "male")
      .sort((a, b) => formatName(a.name).localeCompare(formatName(b.name)));
    const females = students
      .filter((s) => s.sex === "female")
      .sort((a, b) => formatName(a.name).localeCompare(formatName(b.name)));
    return [
      { label: "Female", data: females },
      { label: "Male", data: males },
    ];
  }, [students]);

  const periods: ("prelim" | "midterm" | "prefinals" | "finals")[] = [
    "prelim",
    "midterm",
    "prefinals",
    "finals",
  ];

  const groupedRecords: Record<string, AttendanceRecord[]> = {};
  periods.forEach(
    (p) => (groupedRecords[p] = attendanceRecords.filter((r) => r.period === p))
  );

  const periodColors: Record<string, string> = {
    prelim: "bg-yellow-50",
    midterm: "bg-green-50",
    prefinals: "bg-blue-50",
    finals: "bg-purple-50",
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "early_out":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case "present": return "P";
      case "absent": return "A";
      case "late": return "L";
      case "excused": return "E";
      case "early_out": return "EO";
      default: return "-";
    }
  };

  const calculateAttendanceGrade = (
    studentId: number,
    records: AttendanceRecord[]
  ) => {
    const total = records.length;
    if (total === 0) return 0;
    const presentCount = records.filter(
      (r) => r.attendance[studentId] === "present"
    ).length;
    const percentage = (presentCount / total) * 100;
    return (percentage * 0.1).toFixed(2);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse relative">
          <thead className="bg-gray-50">
            <tr>
              {/* --- Fixed Column 1: Student ID --- */}
              <th
                className="p-3 text-left text-xs font-semibold text-gray-600 border-r md:sticky md:left-0 bg-gray-50 z-20"
                style={{ minWidth: ID_COL_WIDTH, width: ID_COL_WIDTH }}
              >
                Student ID
              </th>

              {/* --- Fixed Column 2: Student Name --- */}
              <th
                className="p-3 text-left text-xs font-semibold text-gray-600 border-r md:sticky bg-gray-50 z-20 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]"
                style={{ 
                    minWidth: NAME_COL_WIDTH, 
                    width: NAME_COL_WIDTH,
                    left: ID_COL_WIDTH // Dynamically positioned after ID column
                }}
              >
                Student Name
              </th>

              {periods.map((period) => (
                <React.Fragment key={period}>
                  {groupedRecords[period].map((record) => (
                    <th
                      key={record.date}
                      className={`p-2 text-center text-xs font-semibold text-gray-600 border-l ${periodColors[period]}`}
                    >
                      <div className="flex flex-col items-center whitespace-nowrap">
                        <span className="text-xs font-semibold">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th
                    className={`p-2 text-center text-xs font-bold text-gray-700 border-l ${periodColors[period]}`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)} Grade
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {groupedStudents.map((group) => (
              <React.Fragment key={group.label}>
                <tr className="bg-gray-100">
                  <td
                    colSpan={periods.length * 4 + 2} // +2 for the fixed columns
                    className="text-left font-semibold px-3 py-2 text-gray-700 md:sticky md:left-0 z-10"
                  >
                    {group.label}
                  </td>
                </tr>

                {group.data.map((student, index) => (
                  <tr
                    key={student.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* --- Fixed Body Cell 1: Student ID --- */}
                    <td 
                        className="p-3 text-sm font-medium text-gray-900 border-r md:sticky md:left-0 bg-inherit z-10"
                        style={{ minWidth: ID_COL_WIDTH, width: ID_COL_WIDTH }}
                    >
                      {student.student_id}
                    </td>

                    {/* --- Fixed Body Cell 2: Student Name --- */}
                    <td 
                        className="p-3 text-sm text-gray-900 border-r md:sticky bg-inherit z-10 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]"
                        style={{ 
                            minWidth: NAME_COL_WIDTH, 
                            width: NAME_COL_WIDTH,
                            left: ID_COL_WIDTH 
                        }}
                    >
                      {formatName(student.name)}
                    </td>

                    {periods.map((period) => (
                      <React.Fragment key={period}>
                        {groupedRecords[period].map((record) => {
                          const status =
                            record.attendance[student.id] || "unknown";
                          return (
                            <td
                              key={`${student.id}-${record.date}`}
                              className={`p-2 text-center text-xs font-medium ${getStatusColor(
                                status
                              )}`}
                            >
                              {getStatusText(status)}
                            </td>
                          );
                        })}
                        <td
                          className={`p-2 text-center text-xs font-bold text-gray-800 border-l ${periodColors[period]}`}
                        >
                          {calculateAttendanceGrade(
                            student.id,
                            groupedRecords[period]
                          )}
                          %
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixedColumnAttendanceTable;