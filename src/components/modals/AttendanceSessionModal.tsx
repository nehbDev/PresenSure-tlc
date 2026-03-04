import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaQuestionCircle,
  FaSignal,
  FaWalking,
  FaSignOutAlt,
  FaSignInAlt,
  FaBan,
  FaListUl,
} from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import type { StudentResult } from "../../types/attendanceTypes";
import { createPortal } from "react-dom";

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
  const [activeTab, setActiveTab] = useState<"breakdown" | "detections">(
    "breakdown",
  );

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("breakdown");
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  // --- Helpers ---
  const formatTime = (input: string) => {
    if (!input || input === "--" || input === "--:--") return "--:--";
    if (input.includes("-") || input.includes("T")) {
      const date = new Date(input);
      if (isNaN(date.getTime())) return "--:--";
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const [hours, minutes] = input.split(":");
    if (hours && minutes) {
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return input;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Excused": // Added Excused color logic
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <FaCheckCircle className="w-3 h-3 text-green-600" />;
      case "Late":
        return <FaClock className="w-3 h-3 text-yellow-600" />;
      case "Absent":
        return <FaTimesCircle className="w-3 h-3 text-red-600" />;
      default:
        return <FaQuestionCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getProximityStyle = (status: string) => {
    if (status.includes("Immediate"))
      return "border-blue-200 bg-blue-50 text-blue-800";
    return "border-gray-200 bg-white text-gray-600";
  };

  const getReasonBadge = (reason: string) => {
    const baseClass =
      "px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 w-fit";
    switch (reason) {
      case "LATE_ARRIVAL":
        return (
          <span
            className={`${baseClass} bg-blue-50 border-blue-200 text-blue-700`}
          >
            <FaClock /> LATE ARRIVAL
          </span>
        );
      case "AWAY_MID_CLASS":
        return (
          <span
            className={`${baseClass} bg-gray-100 border-gray-200 text-gray-600`}
          >
            <FaWalking /> LEFT ROOM
          </span>
        );
      case "LEFT_EARLY":
        return (
          <span
            className={`${baseClass} bg-gray-100 border-gray-200 text-gray-600`}
          >
            <FaSignOutAlt /> LEFT EARLY
          </span>
        );
      case "NO_SHOW":
        return (
          <span
            className={`${baseClass} bg-gray-100 border-gray-200 text-gray-600`}
          >
            <FaBan /> NO SHOW
          </span>
        );
      default:
        return (
          <span
            className={`${baseClass} bg-gray-50 border-gray-200 text-gray-500`}
          >
            {reason}
          </span>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
      {/* Container with Fixed Height and Flex Layout */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden h-[85vh] sm:h-[650px]">
        {/* 1. Header (Pinned) */}
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            Attendance Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded-full"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* 2. Top Info Section (Pinned) */}
        <div className="px-6 pt-6 shrink-0 bg-white relative z-10 shadow-sm">
          {/* Profile & Status Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={student.profile_image || noProfile}
                alt="Profile"
                className="w-16 h-16 rounded-full border border-gray-200 object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {student.lastname},{" "}
                  {(student.student_name || "").split(",")[1] || ""}
                </h3>
                <p className="text-sm text-gray-500 font-mono mt-0.5">
                  {student.student_id}
                </p>

                {student.program !== "N/A" && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-2 py-1 rounded border border-gray-200">
                      {student.program} {student.year_level}-{student.block}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusStyle(student.final_status)}`}
              >
                {getStatusIcon(student.final_status)}
                {student.final_status}
              </span>
            </div>
          </div>

          {/* Time & Proximity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col justify-center items-center shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaSignInAlt className="text-blue-600 text-xs" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time In
                </span>
              </div>
              <span className="text-xl font-mono font-bold text-gray-900 mt-1">
                {formatTime(student.time_in)}
              </span>
              {student.minutes_late > 0 && (
                <span className="text-[10px] text-gray-500 font-bold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full mt-1">
                  +{student.minutes_late} min late
                </span>
              )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col justify-center items-center shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaSignOutAlt className="text-blue-600 text-xs" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time Out
                </span>
              </div>
              <span className="text-xl font-mono font-bold text-gray-900 mt-1">
                {formatTime(student.time_out)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col justify-center items-center shadow-sm ${getProximityStyle(student.proximity_status)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FaSignal className="text-blue-600 text-xs" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Proximity
                </span>
              </div>
              <span className="text-lg font-bold mt-1">
                {student.proximity_status}{" "}
                {student.first_rssi && (
                  <span className="text-[10px] opacity-60 font-mono ml-1">
                    ({student.first_rssi} dBm)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("breakdown")}
              className={`pb-3 px-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                activeTab === "breakdown"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaClock /> Activity Breakdown
            </button>
            <button
              onClick={() => setActiveTab("detections")}
              className={`pb-3 px-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                activeTab === "detections"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaListUl /> All Detections
            </button>
          </div>
        </div>

        {/* 3. Scrollable List Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {/* Tab Content: Activity Breakdown */}
          {activeTab === "breakdown" && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-end mb-3">
                <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  Total Away:{" "}
                  <span className="text-gray-900">
                    {student.away_analysis.total_away_readable}
                  </span>
                </span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-500 font-bold uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-bold uppercase tracking-wider">
                        Start
                      </th>
                      <th className="px-4 py-3 text-left text-gray-500 font-bold uppercase tracking-wider">
                        End
                      </th>
                      <th className="px-4 py-3 text-right text-gray-500 font-bold uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.away_analysis.away_intervals.length > 0 ? (
                      student.away_analysis.away_intervals.map(
                        (interval, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-4 py-3 align-middle">
                              {getReasonBadge(interval.reason)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono align-middle font-medium">
                              {formatTime(interval.start)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono align-middle font-medium">
                              {formatTime(interval.end)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 font-bold align-middle">
                              {interval.duration_readable}
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaCheckCircle className="text-blue-600 text-xl mb-2" />
                            <p className="font-bold text-gray-600">
                              Full Attendance
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Student was present for the entire session.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 text-right">
                * Gaps smaller than 5 minutes are ignored.
              </p>
            </div>
          )}

          {/* Tab Content: All Detections */}
          {activeTab === "detections" && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-500 font-bold uppercase tracking-wider">
                        Time Detected
                      </th>
                      <th className="px-4 py-3 text-right text-gray-500 font-bold uppercase tracking-wider">
                        Signal Strength (RSSI)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.all_detections &&
                    student.all_detections.length > 0 ? (
                      student.all_detections.map(
                        (detection: any, idx: number) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-800 font-mono font-medium align-middle">
                              {formatTime(detection.detected_at)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 font-mono align-middle">
                              {detection.rssi} dBm
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-10 text-center text-gray-400"
                        >
                          <p className="font-bold text-gray-600">
                            No Detections Found
                          </p>
                          <p className="text-xs mt-1">
                            The system did not record any raw location pings for
                            this student.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 text-right">
                * Showing all raw BLE pings recorded by the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AttendanceSessionModal;
