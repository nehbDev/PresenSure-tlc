import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Breadcrumbs from "../layout/Breadcrumbs";
import apiService from "../services/ApiService";
import ContentLoader from "react-content-loader"; // Import for Header Skeleton

// Import TanStack Query
import { useQuery } from "@tanstack/react-query";

// Import Tables
import AttendancePeriodsTable, { type PeriodsApiResponse } from "../components/tables/AttendancePeriodsTable";
import AttendanceSchedulesTable, { type SessionData } from "../components/tables/AttendanceSchedulesTable";

// Import Exporter

// --- API Response Interfaces ---
interface SchedulesApiResponse {
  success: boolean;
  course_code: string;
  description: string;
  history: SessionData[];
  message?: string;
}

// --- HEADER SKELETON COMPONENT ---
const HeaderSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-200">
    <ContentLoader 
      speed={2}
      width={400}
      height={30}
      viewBox="0 0 400 30"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Simulates "Course Code | Description" */}
      <rect x="0" y="0" rx="4" ry="4" width="120" height="28" />
      <rect x="130" y="4" rx="3" ry="3" width="5" height="20" /> {/* Separator */}
      <rect x="145" y="4" rx="4" ry="4" width="200" height="20" />
    </ContentLoader>
  </div>
);

const CourseAttendanceSessions: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  // --- State ---
  const [activeTab, setActiveTab] = useState<"schedules" | "periods">("schedules");

  // --- 1. TANSTACK QUERY: Schedules ---
  const { 
    data: schedulesData, 
    isLoading: loadingSchedules, 
  } = useQuery({
    queryKey: ["attendance_sessions", courseId],
    queryFn: async () => {
      const response = await apiService.get<SchedulesApiResponse>(`/CourseAttendanceSessions/${courseId}`);
      return response.data;
    },
    enabled: !!courseId && activeTab === "schedules", // Fetch when tab is active
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- 2. TANSTACK QUERY: Periods ---
  const { 
    data: periodsData, 
    isLoading: loadingPeriods,
  } = useQuery({
    queryKey: ["attendance_periods", courseId],
    queryFn: async () => {
      const response = await apiService.get<PeriodsApiResponse>(`/courses/${courseId}/attendance-by-period`);
      return response.data;
    },
    enabled: !!courseId && activeTab === "periods", // Fetch when tab is active
    staleTime: 1000 * 60 * 5,
  });

  // --- Derived State for UI ---
  // Determine which data is currently "active" to populate the header
  const activeCourseInfo = activeTab === "schedules" 
    ? { code: schedulesData?.course_code, desc: schedulesData?.description }
    : { code: periodsData?.course, desc: periodsData?.description };
  
  const isLoading = activeTab === "schedules" ? loadingSchedules : loadingPeriods;

  // --- Handlers ---


  const crumbs = [
    { label: "Attendance Records", to: "/records" },
    { label: activeCourseInfo.code || "Course View" },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header Area */}
      <div className="flex flex-col space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        
        {/* HEADER: Show Skeleton if loading, otherwise show data */}
        {isLoading && !activeCourseInfo.code ? (
          <HeaderSkeleton />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left Side: Title */}
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {activeCourseInfo.code || "Loading..."}
              <span className="font-light text-gray-400">|</span> 
              <span className="text-lg text-gray-600">{activeCourseInfo.desc}</span>
            </h1>


          </div>
        )}
      </div>

      {/* TABS CONTAINER */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex gap-5 border-b border-gray-300 text-sm mb-2">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`relative px-4 py-2 font-semibold transition ${
              activeTab === "schedules"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Schedules
          </button>

          <button
            onClick={() => setActiveTab("periods")}
            className={`relative px-4 py-2 font-semibold transition ${
              activeTab === "periods"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Periods
          </button>
        </div>

        {/* Content Area */}
        {/* We pass the 'loading' prop to the tables so they can render their own TableSkeleton */}
        <div>
          {activeTab === "schedules" ? (
            <AttendanceSchedulesTable 
                data={schedulesData?.history || []} 
                loading={loadingSchedules} 
            />
          ) : (
            <AttendancePeriodsTable 
                data={periodsData || null} 
                loading={loadingPeriods} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAttendanceSessions;