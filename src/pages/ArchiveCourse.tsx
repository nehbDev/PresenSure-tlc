import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { FaSearch } from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import ArchiveCourseTable from "../components/tables/ArchiveCourseTable";

// Updated Interface
interface ArchivedCourse {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  deleted_at: string;
  instructor: string;         // Added
  instructor_image?: string;  // Added
}

interface ApiResponse {
  data: ArchivedCourse[];
}

const ArchiveCourse: React.FC = () => {
  const [search, setSearch] = useState("");
  const crumbs = [{ label: "Schedules", to: "/schedules" }, { label: "Archives" }];

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["archived_courses"],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse>("/courses/archives");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching archives:", error);
      toast.error("Error fetching archived courses");
    }
  }, [isError, error]);

  const filteredCourses = courses.filter((course) => {
    if (!search) return true;
    const code = course.subject_code.toLowerCase();
    const desc = course.description.toLowerCase();
    const instructor = (course.instructor || "").toLowerCase();
    const query = search.toLowerCase();
    return code.includes(query) || desc.includes(query) || instructor.includes(query);
  });

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      <div className="flex flex-col space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-200 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-lg font-bold text-gray-800 ">
              Archived Courses
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-[300px]">
            <label htmlFor="search" className="sr-only">Search archives</label>
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="search"
              type="text"
              placeholder="Search by Code, Name, or Instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table Component */}
        <ArchiveCourseTable courses={filteredCourses} loading={isLoading} />
      </div>
    </div>
  );
};

export default ArchiveCourse;