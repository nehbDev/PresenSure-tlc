import React from "react";
import {
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import type { LocationLog, StudentResult } from "../../types/attendanceTypes";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentResult | null;
}

const AttendanceSessionModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen || !student) return null;

  // --- Helpers ---
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Late":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <FaCheckCircle className="w-3 h-3" />;
      case "Late":
        return <FaClock className="w-3 h-3" />;
      case "Absent":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaQuestionCircle className="w-3 h-3" />;
    }
  };

  // Calculate Time In and Time Out from logs
  const getBleTimes = (logs: LocationLog[]) => {
    if (!logs || logs.length === 0)
      return { timeIn: "--:--", timeOut: "--:--" };

    // Sort logs by time to ensure accuracy
    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime(),
    );

    const first = sortedLogs[0].detected_at;
    const last = sortedLogs[sortedLogs.length - 1].detected_at;

    return {
      timeIn: formatTime(first),
      timeOut: formatTime(last),
    };
  };

  const { timeIn, timeOut } = getBleTimes(student.locations_data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Attendance Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={student.profile_image || noProfile}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover shadow-sm"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {student.lastname},{" "}
                  {(student.student_name || "").split(",")[1] || ""}
                </h3>
                <p className="text-sm text-gray-500">{student.student_id}</p>
                <div className="mt-1">
                  {student.program !== "N/A" ? (
                    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-lg border border-blue-100">
                      {student.program}-{student.block} - {student.year_level}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">
                      No Academic Record
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                student.final_status,
              )}`}
            >
              {getStatusIcon(student.final_status)}
              {student.final_status}
            </span>
          </div>

          {/* Stats Grid: Displaying Time In and Time Out */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                TIME IN
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-mono text-gray-800 font-bold">
                  {timeIn}
                </p>
                {student.minutes_late > 0 && (
                  <span className="text-xs text-red-500 font-semibold">
                    (+{student.minutes_late} min late)
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                TIME OUT
              </p>
              <p className="text-lg font-mono text-gray-800 font-bold">
                {timeOut}
              </p>
            </div>
          </div>

          {/* System Note */}
          {student.note && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-yellow-800 uppercase">
                  System Note
                </p>
                <p className="text-sm text-yellow-700 leading-tight">
                  {student.note}
                </p>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
              BLE Detection Logs
            </h4>
            {(student.locations_data || []).length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-40 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">
                        Time
                      </th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">
                        RSSI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.locations_data.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800 font-mono">
                          {new Date(log.detected_at).toLocaleTimeString(
                            "en-US",
                            { hour12: false },
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {log.rssi} dBm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded border border-dashed border-gray-300 text-center">
                No BLE beacon data recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSessionModal;
