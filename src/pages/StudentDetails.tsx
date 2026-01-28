import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import noProfile from "../assets/noProfile.webp";
import {
  FaIdCard,
  FaClock,
  FaBookOpen,
  FaEdit,
  FaArchive,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import StudentDetailsSkeleton from "../components/contentLoader/StudentDetailsSkeleton";
import ArchiveStudent from "../components/modals/ArchiveStudentModal"; // 1. Import Modal
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- Interfaces ---
// ... [Keep your interfaces (Schedule, Instructor, Course, etc.) exactly the same] ...
interface Schedule {
  schedule_id: number;
  schedule_type: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
  building: string;
}

interface Instructor {
  user_id: string;
  firstname: string;
  lastname: string;
  profile?: {
    image_link: string;
  };
}

interface Course {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  schedules: Schedule[];
  users: Instructor[];
}

interface UserProfile {
  image_link: string;
}

interface StudentData {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex: string;
  student_id: string;
  program: string;
  year_level: string;
  block: string;
  status: string;
  profile?: UserProfile;
  courses: Course[];
}

interface ApiResponse {
  status: string;
  data: StudentData;
}

const StudentDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");

  // State for Modal
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const queryClient = useQueryClient();

  const crumbs = [
    { label: "Students", to: "/students" },
    { label: "Student Details" },
  ];

  const {
    data: student,
    isLoading,
    isFetching,
    isStale,
    isError,
    error,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      console.log(
        `%c[Network] Fetching details for Student ${id} at ${new Date().toLocaleTimeString()}`,
        "color: #00ff00; font-weight: bold;",
      );
      const response = await apiService.get<ApiResponse>(
        `/studentDetails?id=${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (isFetching)
      console.log(`%c[Status] Fetching details...`, "color: orange");
    else if (!isLoading)
      console.log(`%c[Status] Details loaded or idle.`, "color: gray");
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (!isLoading && student) {
      if (isStale) console.log(`%c[Cache] Detail data is STALE.`, "color: red");
      else console.log(`%c[Cache] Detail data is FRESH.`, "color: cyan");
    }
  }, [isStale, isLoading, student]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching student:", error);
      toast.error("Error loading student details");
    }
  }, [isError, error]);

  const handleArchive = async () => {
    if (!id) return;
    
    try {
      setIsArchiving(true);
      await apiService.delete(`/archiveStudent/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["archived_students"] });
      
      toast.success("Student archived successfully");
      setShowArchiveModal(false);

      // 3. THE FIX: Force the list page to refresh next time it loads
      await queryClient.invalidateQueries({ queryKey: ["students"] }); 
      
      setTimeout(() => {
        navigate("/students");
      }, 1000);
    } catch (error: any) {
      console.error("Archive error:", error);
      toast.error(error.response?.data?.message || "Failed to archive student");
      setIsArchiving(false);
    }
  };
  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {isLoading ? (
        <StudentDetailsSkeleton />
      ) : !student ? (
        <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow">
          <p className="text-sm text-red-500 font-medium">
            Student not found or invalid ID.
          </p>
        </div>
      ) : (
        <>
          {/* Student Header Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 relative">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex-shrink-0">
                <img
                  src={student.profile?.image_link || noProfile}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-50"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {student.lastname}, {student.firstname} {student.suffix}{" "}
                      {student.middle_initial
                        ? `${student.middle_initial}.`
                        : ""}
                    </h1>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <FaIdCard className="text-blue-500" /> {student.user_id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${student.sex === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                      >
                        {student.sex}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${student.status === "enrolled" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {student.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/students/student-edit?id=${student.user_id}`)
                      }
                      className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <FaEdit className="mr-1 h-5 w-5" />
                      Edit Student
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
                      Program
                    </p>
                    <p
                      className="text-gray-800 font-semibold truncate"
                      title={student.program}
                    >
                      {student.program}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Year Level
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {student.year_level}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Block
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {student.block}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBookOpen className="text-blue-600" />
              Enrolled Courses
            </h2>

            {student.courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {student.courses.map((course) => {
                  const instructor = course.users?.[0];
                  const instructorImage =
                    instructor?.profile?.image_link || noProfile;
                  const instructorName = instructor
                    ? `${instructor.firstname} ${instructor.lastname}`
                    : "TBA";

                  return (
                    <div
                      key={course.course_id}
                      className="h-auto md:h-28 rounded-lg overflow-hidden shadow-sm bg-white border border-gray-200 flex flex-col md:flex-row"
                    >
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

                      <div className="w-full md:w-[40%] p-3 flex flex-col justify-center gap-2 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
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
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-1 bg-gray-50 rounded text-gray-400 text-xs italic text-center">
                            Schedule To be arranged
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-[30%] p-4 flex items-center gap-4 bg-white">
                        <div className="shrink-0 relative">
                          <img
                            src={instructorImage}
                            alt="Instructor"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                            Instructor
                          </p>
                          <p
                            className="text-sm font-semibold text-gray-800 truncate"
                            title={instructorName}
                          >
                            {instructorName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500">
                  No courses enrolled for the active semester.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. USE CONFIRMATION MODAL */}
      <ArchiveStudent
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
        title="Archive Student?"
        message={
          <>
            Are you sure you want to archive{" "}
            <strong>
              {student?.firstname} {student?.lastname}
            </strong>
            ? This will move the student to the archive list and remove them
            from active enrollment views.
          </>
        }
        confirmText="Yes, Archive"
        isLoading={isArchiving}
      />
    </div>
  );
};

export default StudentDetails;
