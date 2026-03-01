import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import noProfile from "../assets/noProfile.webp";
import {
  FaChalkboardTeacher,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaArchive,
} from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EnrolledStudentsTable, {
  type EnrolledStudent,
} from "../components/tables/EnrolledStudentsTable";
import ScheduleDetailsSkeleton from "../components/contentLoader/ScheduleDetailsSkeleton";
import ArchiveCourseModal from "../components/modals/ArchiveCourseModal"; // 1. Imported

// --- Interfaces ---
interface Schedule {
  schedule_id: number;
  schedule_type: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
}

interface InstructorDetails {
  user_id?: string;
  name: string;
  image?: string;
  email?: string;
}

interface CourseDetailsData {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  semester?: {
    description: string;
    schoolyear_start: number;
    schoolyear_end: number;
  };
  schedules: Schedule[];
  instructor_details: InstructorDetails;
  enrolled_students: EnrolledStudent[];
}

interface ApiResponse {
  message: string;
  data: CourseDetailsData;
}

const ScheduleDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();

  // --- Modal State ---
  // 2. State is declared here
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const crumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Schedules", to: "/schedules" },
    { label: "Course Details" },
  ];

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course_details", id],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse>(
        `/course/${id}/details`,
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching course:", error);
      toast.error("Error loading course details");
    }
  }, [isError, error]);

  // 3. Function is declared here
  const handleArchiveCourse = async () => {
    if (!id) return;
    setIsArchiving(true);
    try {
      await apiService.delete(`/course/${id}/archive`);

      toast.success("Course archived successfully");
      setIsArchiveModalOpen(false);

      // --- FIX STARTS HERE ---
      // 1. Invalidate the 'Archive Page' list so it fetches the new data
      await queryClient.invalidateQueries({ queryKey: ["archived_courses"] });

      // 2. Invalidate the 'Main Schedule' list so this course disappears from there
      await queryClient.invalidateQueries({
        queryKey: ["courses_active_semester"],
      });
      // --- FIX ENDS HERE ---

      setTimeout(() => {
        // Redirect to the Archive page to see the result immediately
        navigate("/schedules/schedule-archives");
        // Or navigate("/schedules") if you prefer going back to the main list
      }, 500);
    } catch (error: any) {
      console.error("Archive error:", error);
      toast.error(error?.response?.data?.message || "Failed to archive course");
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <ScheduleDetailsSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <div className="bg-white p-8 text-center rounded-lg shadow text-red-500">
          Course not found.
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {/* --- Main Header Card --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Left: Instructor Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={course.instructor_details.image || noProfile}
                alt="Instructor"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 shadow-sm"
              />
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 w-full">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                {/* Left Side: Course Details */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {course.subject_code}
                  </h1>
                  <p className="text-lg text-gray-500 font-medium mt-1">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md text-sm font-medium text-gray-700 border border-gray-200">
                      <FaChalkboardTeacher className="text-blue-500" />
                      {course.instructor_details.name}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() =>
                      navigate(
                        `/schedules/schedule-edit?id=${course.course_id}`,
                      )
                    }
                    className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
                  >
                    <FaEdit className="mr-2 h-4 w-4" />
                    Edit Course
                  </button>

                  <button
                    // 4. FIX: Use setIsArchiveModalOpen here
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="flex items-center bg-white border border-red-300 text-red-600 px-4 py-2 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition shadow-sm"
                  >
                    <FaArchive className="mr-2 h-4 w-4" />
                    Archive
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Dynamic Schedule Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.schedules.length > 0 ? (
                course.schedules.map((sched) => (
                  <div
                    key={sched.schedule_id}
                    className="bg-blue-50 p-4 rounded-md border border-blue-100 relative overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-bl-md
                        ${sched.schedule_type === "Laboratory" ? "bg-orange-100 text-orange-700" : "bg-blue-200 text-blue-800"}
                      `}
                    >
                      {sched.schedule_type}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>{sched.days}</span>
                      </div>

                      <div className="flex items-center gap-2 ">
                        <FaClock className="text-blue-500" />
                        <span>
                          {formatTime(sched.start_time)} -{" "}
                          {formatTime(sched.end_time)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-bold text-gray-800">
                          {sched.room}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 italic">
                  No schedule assigned.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Enrolled Students Table --- */}
      <EnrolledStudentsTable
        students={course.enrolled_students}
        loading={isLoading}
      />

      {/* 5. FIX: Add the Modal Component here so it is used */}
      <ArchiveCourseModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveCourse}
        subjectCode={course.subject_code}
        isLoading={isArchiving}
      />
    </div>
  );
};

export default ScheduleDetails;
