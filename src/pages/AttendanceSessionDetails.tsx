import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaMobileAlt,
  FaFileExcel,
} from "react-icons/fa";
import apiService from "../services/ApiService";
import Breadcrumbs from "../layout/Breadcrumbs";
import AttendanceSessionDetailsTable from "../components/tables/AttendanceSessionDetailsTable";
import AttendanceSessionModal from "../components/modals/AttendanceSessionModal";
import { exportAttendanceToExcel } from "../utils/excelExporterSession";
import SessionHeaderSkeleton from "../components/contentLoader/SessionHeaderSkeleton";

// 1. Import TanStack Query
import { useQuery } from "@tanstack/react-query";

// IMPORT THE SHARED TYPES
import type { StudentResult } from "../types/attendanceTypes";

interface SessionMetadata {
  attendance_session_id: number;
  status: string;
  device_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  instructor: { id: string; name: string };
  course: {
    course_id: number;
    code: string;
    description: string;
    schedule_type: string;
    room: string;
  };
}

interface AttendanceSessionResponse {
  message: string;
  session_metadata: SessionMetadata;
  students: StudentResult[];
}

const AttendanceSessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  // --- Modal State ---
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 2. QUERY LOGIC (Replaces useState/useEffect for fetching) ---
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["attendance_session_details", sessionId],
    queryFn: async () => {
      // Debug log (optional)
      // console.log(`%c[Network] Fetching session ${sessionId}...`, "color: #00ff00; font-weight: bold;");

      const response = await apiService.get<AttendanceSessionResponse>(
        `/attendance/calculate/${sessionId}`,
      );
      return response.data;
    },
    enabled: !!sessionId, // Only run if sessionId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // --- 3. Derived State ---
  const sessionData = apiResponse?.session_metadata || null;
  const students = apiResponse?.students || [];
  const loading = isLoading;

  const safeStudents = students;
  const maleStudents = safeStudents.filter((s) => s.sex === "Male");
  const femaleStudents = safeStudents.filter((s) => s.sex === "Female");

  // --- 4. Error Handling Effect ---
  useEffect(() => {
    if (isError) {
      console.error("Error fetching session:", error);
      toast.error("Failed to load session details.");
    }
  }, [isError, error]);

  // --- Handlers ---
  const handleRowClick = (student: StudentResult) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const formatTime12 = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      toast.error("No student data to export.");
      return;
    }
    // Ensure sessionData is not null before exporting
    if (sessionData) {
      exportAttendanceToExcel(sessionData, students);
      toast.success("Excel report downloaded!");
    } else {
      toast.error("Session data not available.");
    }
  };

  // If NOT loading and NO data, show error state
  if (!loading && !sessionData && !isError)
    return (
      <div className="p-8 text-center text-red-500">
        Session Not Found or Data Error
      </div>
    );

  const crumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Attendance Records", to: "/records" },
    {
      label: sessionData?.course?.code || "Course",
      to: sessionData
        ? `/records/attendance/${sessionData.course?.course_id}`
        : "#",
    },
    { label: "Session Details" },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header Area */}
      <div className="flex flex-col space-y-4">
        <Breadcrumbs crumbs={crumbs} />

        {/* Title and Button Section */}
        {loading ? (
          // Simple Skeleton for title area
          <div className="bg-white p-6 rounded-lg shadow-md h-20 animate-pulse"></div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {sessionData?.course?.code || "N/A"} -{" "}
                {sessionData?.course?.description || "Unknown Course"}
              </h1>
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-colors font-medium text-sm"
            >
              <FaFileExcel className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* Session Metadata Card or Skeleton */}
      {loading ? (
        <SessionHeaderSkeleton />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* --- TOP ROW: Type & Status Only --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-blue-800">
                {sessionData?.course?.schedule_type || "Lecture"}
              </span>

            </div>
            {/* Room badge removed from here */}
          </div>

          {/* --- BOTTOM GRID: Now 5 Columns --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-4 border-t border-blue-100">
            {/* 1. Date */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">
                Date
              </span>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaCalendarAlt className="text-blue-400" /> {sessionData?.date}
              </div>
            </div>

            {/* 2. Time */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">
                Time
              </span>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaClock className="text-blue-400" />
                {formatTime12(sessionData?.start_time ?? null)} -{" "}
                {formatTime12(sessionData?.end_time ?? null)}
              </div>
            </div>

            {/* 3. Room (Moved Here) */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">
                Room
              </span>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaMapMarkerAlt className="text-blue-400" />{" "}
                {/* Changed icon color to match others */}
                <span className="truncate">
                  {sessionData?.course?.room || "No Room"}
                </span>
              </div>
            </div>

            {/* 4. Instructor */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">
                Instructor
              </span>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaChalkboardTeacher className="text-blue-400" />{" "}
                <span className="truncate">
                  {sessionData?.instructor?.name}
                </span>
              </div>
            </div>

            {/* 5. Device ID */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-1">
                Device ID
              </span>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaMobileAlt className="text-blue-400" />{" "}
                <span className="font-mono text-sm">
                  {sessionData?.device_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tables Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        {/* Title Header */}
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800 ">
            Student List
          </h2>
        </div>

        {/* Tables Container */}
        <div className="flex flex-col gap-8">
          {/* Male Table */}
          <AttendanceSessionDetailsTable
            title="Male"
            students={maleStudents}
            headerColor="blue"
            onRowClick={handleRowClick}
            loading={loading}
          />

          {/* Female Table */}
          <AttendanceSessionDetailsTable
            title="Female"
            students={femaleStudents}
            headerColor="pink"
            onRowClick={handleRowClick}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal Component */}
      <AttendanceSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default AttendanceSessionDetails;
