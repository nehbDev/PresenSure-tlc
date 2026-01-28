import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiService from "../services/ApiService";
import Breadcrumbs from "../layout/Breadcrumbs";

// ✅ Import the new Table
import EnrolledStudentsTable from "../components/tables/EnrolledStudentsTable"; 
// ✅ Import the Skeleton
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
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Breadcrumbs Config ---
  const crumbs = [
    { label: "My Schedule", to: "/mySchedule" },
    { label: course ? course.subject_code : "Subject Details" },
  ];

  // --- Fetch Data ---
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<ApiResponse<Course>>(`/viewMyCourse/${id}`);
        setCourse(response.data.data || null);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Error loading subject details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  return (
    <div className="space-y-4">
      
      {/* --- Top Header Section: Breadcrumbs & Action Button --- */}
      {/* This uses 'justify-between' to push Breadcrumbs to left and Button to right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* 1. Breadcrumbs (Visible even during loading) */}
        <Breadcrumbs crumbs={crumbs} />

        {/* 2. Bulk Add Button (Only visible when data is ready) */}
        {!loading && course && (
          <button
            onClick={() => navigate(`/mySchedule/subjects/${course.course_id}/bulk-add-students`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Bulk Add Students
          </button>
        )}
      </div>

      {/* --- Main Content Area --- */}
      {loading ? (
        <MySubjectDetailsSkeleton />
      ) : !course ? (
        // Error State
        <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-semibold text-gray-800">Subject not found</p>
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
            <p className="text-gray-600 font-medium text-lg">{course.description}</p>
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                 <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-semibold">{course.units} Units</span> 
                 <span>•</span>
                 <span>{course.semester?.semester_name || "Current Semester"}</span>
            </div>
          </div>

          {/* --- Schedules Section --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Class Schedules</h2>
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
                                <p className="text-gray-600 text-sm font-medium">
                                {schedule.start_time} - {schedule.end_time}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Location</span>
                                <span className="text-sm font-bold text-gray-800 block mt-0.5">{schedule.room}</span>
                                <span className="block text-xs text-gray-500">{schedule.building}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <p className="text-gray-500 italic">No schedules assigned to this course yet.</p>
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