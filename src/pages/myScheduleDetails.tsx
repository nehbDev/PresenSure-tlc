import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query"; // ✅ Import useQuery
import apiService from "../services/ApiService";
import Breadcrumbs from "../layout/Breadcrumbs";
import EnrolledStudentsTable from "../components/tables/EnrolledStudentsTable";
import MySubjectDetailsSkeleton from "../components/contentLoader/MySubjectDetailsSkeleton";

// --- Interfaces ---
interface Schedule {
  schedule_id: number;
  schedule_type: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
  building: string;
}

interface UserProfile {
  user_profile_id: string;
  image_link: string;
  user_id: string;
}

interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex: string;
  program?: string;
  year_level?: string;
  block?: string;
  profile?: UserProfile;
}

interface Semester {
  semester_id: number;
  semester_name: string;
  status: string;
}

interface Course {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  semester_id: number;
  schedules: Schedule[];
  users: User[];
  semester: Semester;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

const MySubjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Helper: Format Time to 12-hour AM/PM ---
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    // Expecting format "HH:mm:ss" or "HH:mm"
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 to 12
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // --- React Query Fetching ---
  const { 
    data: apiResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["viewMyCourse", id], // Unique key for caching
    queryFn: async () => {
      const response = await apiService.get<ApiResponse<Course>>(
        `/viewMyCourse/${id}`
      );
      return response.data;
    },
    enabled: !!id, // Only fetch if ID exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 1, // Retry once on failure
  });

  // Derived state
  const course = apiResponse?.data || null;

  // --- Error Handling Effect ---
  useEffect(() => {
    if (isError) {
      console.error("Error fetching course:", error);
      toast.error("Error loading subject details");
    }
  }, [isError, error]);

  // --- Breadcrumbs Config ---
  const crumbs = [
    { label: "My Schedule", to: "/mySchedule" },
    { label: course ? course.subject_code : "Subject Details" },
  ];

  return (
    <div className="space-y-4">
      {/* --- Top Header Section: Breadcrumbs & Action Button --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 1. Breadcrumbs */}
        <Breadcrumbs crumbs={crumbs} />

        {/* 2. Action Buttons */}
        {!isLoading && course && (
          <div className="flex gap-3">
            {/* Bulk Remove Button */}
            <button
              onClick={() =>
                navigate(
                  `/mySchedule/subjects/${course.course_id}/bulk-remove-students`
                )
              }
              className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span>-</span> Bulk Remove
            </button>

            {/* Bulk Add Button */}
            <button
              onClick={() =>
                navigate(
                  `/mySchedule/subjects/${course.course_id}/bulk-add-students`
                )
              }
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span>+</span> Bulk Add Students
            </button>
          </div>
        )}
      </div>

      {/* --- Main Content Area --- */}
      {isLoading ? (
        <MySubjectDetailsSkeleton />
      ) : !course ? (
        // Error State (Shown if not loading and no data found)
        <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-semibold text-gray-800">
            Subject not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-all"
          >
            ← Go Back
          </button>
        </div>
      ) : (
        // Loaded Content
        <>
          {/* --- Course Info Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-600 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {course.subject_code}
            </h1>
            <p className="text-gray-600 font-medium text-lg">
              {course.description}
            </p>
          </div>

          {/* --- Schedules Section --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Class Schedules
            </h2>
            {course.schedules && course.schedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.schedules.map((schedule) => (
                  <div
                    key={schedule.schedule_id}
                    className="relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                    <div className="ml-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide mb-1">
                            {schedule.schedule_type}
                          </span>
                          <p className="text-gray-900 font-bold text-lg">
                            {schedule.days}
                          </p>
                          {/* ✅ Formatted Time */}
                          <p className="text-gray-600 text-sm font-medium">
                            {formatTime(schedule.start_time)} -{" "}
                            {formatTime(schedule.end_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Room
                          </span>
                          <span className="text-sm font-bold text-gray-800 block mt-0.5">
                            {schedule.room}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {schedule.building}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <p className="text-gray-500 italic">
                  No schedules assigned to this course yet.
                </p>
              </div>
            )}
          </div>

          {/* --- Students Section --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Enrolled Students
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {course.users?.length || 0}
                </span>
              </h2>
            </div>

            <EnrolledStudentsTable
              students={course.users || []}
              loading={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MySubjectDetails;