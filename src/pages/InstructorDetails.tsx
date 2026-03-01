import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import noProfile from "../assets/noProfile.webp";
import {
  FaIdCard,
  FaClock,
  FaChalkboardTeacher,
  FaEdit,
  FaArchive,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
} from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import StudentDetailsSkeleton from "../components/contentLoader/StudentDetailsSkeleton";
import ArchiveInstructorModal from "../components/modals/ArchiveInstructorModal"; // Corrected Import
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

interface Course {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  schedules: Schedule[];
}

interface UserProfile {
  image_link: string;
}

interface InstructorData {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex: string;
  department: string;
  status: string;
  profile?: UserProfile;
  courses: Course[];
}

interface ApiResponse {
  status: string;
  data: InstructorData;
}

const InstructorDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");

  // --- STATE ---
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const queryClient = useQueryClient();

  const crumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Instructors", to: "/instructors" },
    { label: "Instructor Details" },
  ];

  // --- QUERY LOGIC ---
  const {
    data: instructor,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["instructor", id],
    queryFn: async () => {
      console.log(
        `%c[Network] Fetching details for Instructor ${id}`,
        "color: #00ff00; font-weight: bold;"
      );
      const response = await apiService.get<ApiResponse>(
        `/getInstructorDetails?id=${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // --- DEBUGGERS ---
  useEffect(() => {
    if (isFetching)
      console.log(`%c[Status] Fetching details...`, "color: orange");
    else if (!isLoading)
      console.log(`%c[Status] Details loaded or idle.`, "color: gray");
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching instructor:", error);
      toast.error("Error loading instructor details");
    }
  }, [isError, error]);

  // --- HANDLERS ---
  const handleArchive = async () => {
    if (!id) return;

    try {
      setIsArchiving(true);
      await apiService.delete(`/archiveInstructor/${id}`);
      
      toast.success("Instructor archived successfully");
      setShowArchiveModal(false);

      // Refresh lists
      await queryClient.invalidateQueries({ queryKey: ["instructors"] });
      await queryClient.invalidateQueries({ queryKey: ["archived_instructors"] });

      setTimeout(() => {
        navigate("/instructors");
      }, 1000);
    } catch (error: any) {
      console.error("Archive error:", error);
      toast.error(error.response?.data?.message || "Failed to archive instructor");
      setIsArchiving(false); // Only stop loading on error, success navigates away
    }
  };

  // Calculate total units being taught
  const totalUnits = instructor?.courses.reduce((acc, curr) => acc + curr.units, 0) || 0;

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {isLoading ? (
        <StudentDetailsSkeleton />
      ) : !instructor ? (
        <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow">
          <p className="text-sm text-red-500 font-medium">
            Instructor not found or invalid ID.
          </p>
        </div>
      ) : (
        <>
          {/* Header Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 relative">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex-shrink-0">
                <img
                  src={instructor.profile?.image_link || noProfile}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-50"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {instructor.lastname}, {instructor.firstname} {instructor.suffix}{" "}
                      {instructor.middle_initial
                        ? `${instructor.middle_initial}.`
                        : ""}
                    </h1>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <FaIdCard className="text-blue-500" /> {instructor.user_id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          instructor.sex === "Male"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {instructor.sex}
                      </span>
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700">
                        {instructor.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/instructors/instructor-edit?id=${instructor.user_id}`)
                      }
                      className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <FaEdit className="mr-1 h-5 w-5" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => setShowArchiveModal(true)}
                      className="flex items-center bg-white border border-red-300 text-red-600 px-4 py-2 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                    >
                      <FaArchive className="mr-1 h-5 w-5" />
                      Archive
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Department
                    </p>
                    <p
                      className="text-gray-800 font-semibold truncate"
                      title={instructor.department}
                    >
                      {instructor.department || "N/A"}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Total Classes
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {instructor.courses.length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Total Units
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {totalUnits}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teaching Load Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChalkboardTeacher className="text-blue-600" />
              Courses
            </h2>

            {instructor.courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {instructor.courses.map((course) => (
                  <div
                    key={course.course_id}
                    className="h-auto md:h-28 rounded-lg overflow-hidden shadow-sm bg-white border border-gray-200 flex flex-col md:flex-row"
                  >
                    {/* Course Info (Left) */}
                    <div className="w-full md:w-[30%] bg-gray-50 p-4 border-b md:border-b-0 md:border-r border-gray-200 border-l-4 border-l-blue-600 flex flex-col justify-center">
                      <h3
                        className="font-bold text-gray-800 text-lg truncate"
                        title={course.subject_code}
                      >
                        {course.subject_code}
                      </h3>
                      <p
                        className="text-sm text-gray-600 line-clamp-2"
                        title={course.description}
                      >
                        {course.description}
                      </p>
                      <span className="text-xs text-gray-400 mt-1">
                        {course.units} Units
                      </span>
                    </div>

                    {/* Schedule Info (Middle/Right) */}
                    <div className="w-full md:w-[70%] p-3 flex flex-col justify-center gap-2 overflow-y-auto">
                      {course.schedules && course.schedules.length > 0 ? (
                        course.schedules.map((schedule) => (
                          <div
                            key={schedule.schedule_id}
                            className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-100"
                          >
                            <FaClock className="text-blue-500 shrink-0" />
                            <div className="flex flex-wrap gap-x-2 font-medium">
                              <span className="text-blue-900 font-bold">
                                {schedule.days}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span>
                                {schedule.start_time} - {schedule.end_time}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <FaMapMarkerAlt className="text-red-400 text-[10px]" />
                                {schedule.room}
                              </span>
                              <span className="text-gray-300 hidden sm:inline">|</span>
                              {/* FIXED: Removed extra 'flex' to resolve tailwind conflict */}
                              <span className="hidden sm:flex items-center gap-1 text-gray-600">
                                <FaBuilding className="text-gray-400 text-[10px]" />
                                {schedule.building || "Main"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1 bg-gray-50 rounded text-gray-400 text-xs italic text-center">
                          Schedule To be arranged
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <FaBriefcase className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">
                  No courses assigned for the active semester.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Archive Modal */}
      <ArchiveInstructorModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
        title="Archive Instructor?"
        message={
          <>
            Are you sure you want to archive{" "}
            <strong>
              {instructor?.firstname} {instructor?.lastname}
            </strong>
            ? This will remove them from the active instructor list.
          </>
        }
        confirmText="Yes, Archive"
        isLoading={isArchiving}
      />
    </div>
  );
};

export default InstructorDetails;