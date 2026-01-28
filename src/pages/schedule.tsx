import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Breadcrumbs from "../layout/Breadcrumbs";
import { FaSearch, FaFileImport, FaPlusCircle, FaArchive } from "react-icons/fa";
import apiService from "../services/ApiService";
import ScheduleTable from "../components/tables/scheduleTable";
import { useQuery } from "@tanstack/react-query"; // 1. Import useQuery

interface Subject {
  course_id: number;
  subject_code: string;
  description: string;
  instructor: string;
  instructor_image?: string;
  units: number;
}

const Schedule: React.FC = () => {
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, location.pathname, navigate]);

  // 2. REPLACED: useEffect fetching with useQuery
  const {
    data: subjects = [], // Default to empty array
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
  } = useQuery({
    queryKey: ["courses_active_semester"],
    queryFn: async () => {
      console.log(
        `%c[Network] Fetching schedule data at ${new Date().toLocaleTimeString()}`,
        "color: #00ff00; font-weight: bold;",
      );
      const response = await apiService.get<Subject[]>(
        "/getCoursesForActiveSemester",
      );

      // Data Transformation inside queryFn is best practice
      return response.data.map((subject) => ({
        ...subject,
        instructor: subject.instructor || "TBA",
      }));
    },
    staleTime: 1000 * 60 * 10, // 5 minutes cache
    retry: 1,
  });

  // --- DEBUGGERS (Optional, matched Student.tsx) ---
  useEffect(() => {
    if (isFetching) {
      console.log(`%c[Status] Schedule update STARTED...`, "color: orange");
    } else if (!isLoading) {
      console.log(
        `%c[Status] Schedule update FINISHED or Idle.`,
        "color: gray",
      );
    }
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (isStale) {
      console.log(
        `%c[Cache] Schedule data is STALE.`,
        "color: red; font-weight: bold",
      );
    }
  }, [isStale]);
  // ------------------------------------------------

  // Error Handling
  useEffect(() => {
    if (isError) {
      console.error("Error fetching schedules:", error);
      toast.error("Error fetching schedules");
    }
  }, [isError, error]);

  // Filter subjects based on search
  const filteredSubjects = subjects.filter((subject) => {
    return search
      ? subject.subject_code.toLowerCase().includes(search.toLowerCase()) ||
          subject.description.toLowerCase().includes(search.toLowerCase()) ||
          subject.instructor.toLowerCase().includes(search.toLowerCase())
      : true;
  });

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={[{ label: "Schedules" }]} />

      {/* Header / Search Bar */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white border-b border-gray-300 rounded-lg shadow-sm text-black">
        <div className="flex justify-start w-full">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded pl-8 pr-2 py-1 h-9 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-500 w-4 h-4" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate("/schedules/import-schedule")}
            className="flex items-center bg-blue-600 px-3 py-1.5 text-white text-sm rounded-md hover:bg-blue-500 transition-colors"
          >
            <FaFileImport className="mr-1 h-4 w-4" />
            Import Schedules
          </button>
          <button
            onClick={() => navigate("/schedules/create-schedule")}
            className="flex items-center bg-blue-600 px-3 py-1.5 text-white text-sm rounded-md hover:bg-blue-500 transition-colors"
          >
            <FaPlusCircle className="mr-1 h-4 w-4" />
            Add Schedule
          </button>
          <button
            onClick={() => navigate("/schedules/schedule-archives")}
            className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            style={{ minHeight: 38 }}
          >
            <FaArchive className="mr-1 h-5 w-5" />
            View Archives
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <ScheduleTable subjects={filteredSubjects} loading={isLoading} />
      </div>
    </div>
  );
};

export default Schedule;
