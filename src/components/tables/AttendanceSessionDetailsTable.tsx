import React from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import type { StudentResult } from "../../types/attendanceTypes";
import TableSkeleton from "../contentLoader/TableSkeleton"; 

interface AttendanceTableProps {
  title: string;
  students: StudentResult[];
  headerColor: "blue" | "pink";
  onRowClick: (student: StudentResult) => void;
  loading?: boolean; 
}

const AttendanceSessionDetailsTable: React.FC<AttendanceTableProps> = ({
  title,
  students,
  headerColor,
  onRowClick,
  loading = false, 
}) => {
  
  // --- Helper: Format "15:30:00" to "3:30 PM" ---
  const formatTimeString = (timeStr: string) => {
    if (!timeStr || timeStr === "--" || timeStr === "--:--") return "--:--";
    
    // Check if it's a full ISO string or just time
    const [hours, minutes] = timeStr.split(':');
    
    // Safety check
    if (!hours || !minutes) return timeStr;

    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-800 border-green-200";
      case "Late": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Absent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present": return <FaCheckCircle className="w-3 h-3" />;
      case "Late": return <FaClock className="w-3 h-3" />;
      case "Absent": return <FaTimesCircle className="w-3 h-3" />;
      default: return <FaQuestionCircle className="w-3 h-3" />;
    }
  };

  const themeClass = headerColor === "blue" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-pink-50 border-pink-200 text-pink-800";
  const dotClass = headerColor === "blue" ? "bg-blue-500" : "bg-pink-500";

  return (
    <div className={`border rounded-lg overflow-hidden mb-8 shadow-md ${headerColor === "blue" ? "border-blue-100" : "border-pink-100"}`}>
      {/* Table Header Section */}
      <div className={`p-4 border-b flex justify-between items-center ${themeClass}`}>
        <h3 className="font-bold flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotClass}`}></span>
          {title}
        </h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto bg-white">
        {loading ? (
           // Render Skeleton Rows if loading
           <div className="p-4">
             {[...Array(3)].map((_, i) => (
               <TableSkeleton key={i} />
             ))}
           </div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-3 w-[150px]">ID</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3 text-center">Program</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Time In</th>
                <th className="px-6 py-3 text-center">Time Out</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.length > 0 ? (
                students.map((student) => {
                  return (
                    <tr
                      key={student.student_id}
                      onClick={() => onRowClick(student)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profile_image || noProfile}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <span className="font-medium text-gray-800">
                             {student.lastname}, {(student.student_name || "").split(",")[1] || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {student.program !== "N/A" && (
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-blue-100 text-blue-800 border-blue-200 whitespace-nowrap shadow-sm">
                              {student.program}-{student.block} {student.year_level}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(student.final_status)}`}>
                          {getStatusIcon(student.final_status)}
                          {student.final_status}
                        </span>
                      </td>
                      
                      {/* UPDATED: Use Direct Time Fields */}
                      <td className="px-6 py-3 text-center font-mono text-gray-700">
                        {formatTimeString(student.time_in)}
                      </td>
                      <td className="px-6 py-3 text-center font-mono text-gray-700">
                        {formatTimeString(student.time_out)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                    No {title.toLowerCase()} students recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceSessionDetailsTable;