import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaSearch, FaClipboardCheck, FaCalendarAlt } from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import AttendanceCourseTable, {
  type Course,
} from "../components/tables/AttendanceCourseTable";
import apiService from "../services/ApiService";
import CardSkeleton from "../components/contentLoader/CardSkeleton";
import { useQuery } from "@tanstack/react-query";

// --- INTERFACES ---

interface BackendCourse {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  instructor: string;
  instructor_id: string | number;
  schedule: string;
  total_students: number;
  total_sessions: number;
}

interface ApiResponse {
  success: boolean;
  all_records: BackendCourse[];
  my_records: BackendCourse[];
  message?: string;
}

// --- TAB COMPONENT ---
interface CourseTabsProps {
  counts: { all: number; my: number };
  selected: "all" | "my";
  onSelect: (val: "all" | "my") => void;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-6 border-b border-gray-200 text-sm mb-4">
      <button
        onClick={() => onSelect("all")}
        className={`relative px-2 py-3 font-medium transition-all flex justify-center items-center gap-2 ${
          selected === "all"
            ? "text-blue-700 border-b-2 border-blue-700"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        All Records
        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
          {/* Count could go here */}
        </span>
      </button>
      
      <button
        onClick={() => onSelect("my")}
        className={`relative px-2 py-3 font-medium transition-all flex justify-center items-center gap-2 ${
          selected === "my"
            ? "text-blue-700 border-b-2 border-blue-700"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        My Records
        <span className="bg-blue-50 text-blue-600 py-0.5 px-2 rounded-full text-xs">
          {/* Count could go here */}
        </span>
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

const AttendanceRecord: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false);

  // --- 🔒 AUTH RETRIEVAL ---
  const userString = localStorage.getItem("user");
  const parsedUser = userString ? JSON.parse(userString) : null;
  const user = parsedUser
    ? { ...parsedUser, user_id: parsedUser.id }
    : { role: "student", user_id: 0 };

  const userRole = user?.role || "student";
  const currentUserId = user?.user_id;
  const isAdmin = userRole === "admin" || userRole === "administrator";

  // Force "my" tab if NOT admin
  useEffect(() => {
    if (!isAdmin) {
        setActiveTab("my");
    }
  }, [isAdmin]);

  // Helper to map backend data to frontend interface
  const mapCourses = (data: BackendCourse[]): Course[] => {
    return data.map((item) => ({
      id: item.course_id,
      course_code: item.subject_code,
      description: item.description,
      instructor: item.instructor,
      instructor_id: String(item.instructor_id),
      units: item.units,
      schedule: item.schedule,
      students_count: item.total_students,
      attendance_taken: item.total_sessions,
    }));
  };

  // --- 2. IMPLEMENT TANSTACK QUERY ---
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["attendance_courses", currentUserId, userRole], 
    queryFn: async () => {
      const safeId = currentUserId ? String(currentUserId) : "";
      const safeRole = userRole || "student";

      const response = await apiService.get(
        `/getCourses?user_id=${encodeURIComponent(safeId)}&role=${encodeURIComponent(safeRole)}`
      );
      
      return (response.data || response) as unknown as ApiResponse;
    },
    enabled: !!currentUserId, 
    staleTime: 1000 * 60 * 10, // 5 Minutes
    retry: 1,
  });

  // --- 3. HANDLE DATA TRANSFORMATION ---
  const allCourses = useMemo(() => {
    return apiResponse?.success && apiResponse.all_records 
      ? mapCourses(apiResponse.all_records) 
      : [];
  }, [apiResponse]);

  const myCourses = useMemo(() => {
    return apiResponse?.success && apiResponse.my_records 
      ? mapCourses(apiResponse.my_records) 
      : [];
  }, [apiResponse]);

  // --- 4. HANDLE ERRORS ---
  useEffect(() => {
    if (isError) {
      console.error("Error fetching courses:", error);
      const err = error as any;
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to load courses");
      } else {
        toast.error("Network Error: Unable to fetch courses");
      }
    }
  }, [isError, error]);

  // Handle Success Toast from navigations
  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, navigate, location.pathname]);

  // --- FILTERING LOGIC ---
  const currentSourceData = !isAdmin ? myCourses : (activeTab === "all" ? allCourses : myCourses);

  const filteredCourses = useMemo(() => {
    let result = currentSourceData;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.course_code.toLowerCase().includes(lowerSearch) ||
          c.description.toLowerCase().includes(lowerSearch) ||
          c.instructor.toLowerCase().includes(lowerSearch)
      );
    }

    if (instructorFilter) {
      result = result.filter((c) => c.instructor === instructorFilter);
    }

    return result;
  }, [currentSourceData, search, instructorFilter]);

  const sourceForDropdown = isAdmin ? allCourses : myCourses;
  const instructorOptions = Array.from(
    new Set(sourceForDropdown.map((course) => course.instructor))
  ).filter(Boolean);

  const totalCoursesCount = currentSourceData.length;
  const totalAttendanceTaken = filteredCourses.reduce(
    (sum, course) => sum + course.attendance_taken,
    0
  );

  const handleViewAttendance = (courseId: number) => {
    navigate(`/records/attendance/${courseId}`);
  };

  const handleTakeAttendance = (courseId: number) => {
    navigate(`/records/take-attendance/${courseId}`);
  };

  const crumbs = [{ label: "Attendance Records" }];
  const loading = isLoading; 

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          icon={<FaCalendarAlt className="text-blue-600 text-4xl" />}
          label={isAdmin && activeTab === 'all' ? "All Courses" : "My Courses"}
          value={totalCoursesCount.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaClipboardCheck className="text-blue-600 text-4xl" />}
          label="Attendance Sessions"
          value={totalAttendanceTaken.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
      </div>

      {isAdmin && (
        <CourseTabs
          counts={{ all: allCourses.length, my: myCourses.length }}
          selected={activeTab}
          onSelect={(tab) => {
            setActiveTab(tab);
            setInstructorFilter("");
          }}
        />
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
        
        {/* --- CONDITIONALLY RENDER DROPDOWN --- */}
        {/* ONLY show filter if Admin AND viewing 'All Records' */}
        {isAdmin && activeTab === "all" && (
          <div className="min-h-[42px] w-48 flex-shrink-0">
            <DropdownFilter
              label="Instructor"
              options={instructorOptions}
              selected={instructorFilter}
              setSelected={setInstructorFilter}
            />
          </div>
        )}

        <div className="flex-1 min-h-[42px]">
          <div className="relative flex items-center h-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <AttendanceCourseTable
        courses={filteredCourses}
        loading={loading}
        onViewAttendance={handleViewAttendance}
        onTakeAttendance={handleTakeAttendance}
        // ✅ PASS showInstructor PROP HERE
        showInstructor={activeTab === "all"} 
      />
    </div>
  );
};

// --- SUB COMPONENTS ---

const DropdownFilter: React.FC<{
  label: string;
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
}> = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex justify-between items-center w-full min-h-[42px] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <span className="truncate">{selected || `Select ${label}`}</span>
        <svg
          className={`ml-2 h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="origin-top-right absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => {
                setSelected("");
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selected === "" ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              All
            </button>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selected === option ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Card: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  loading?: boolean;
}> = ({ icon, label, value, colorClass, loading }) => (
  <div
    className={`bg-white border-t-4 ${colorClass} shadow rounded-lg p-6 flex items-center space-x-4 h-[106px]`}
  >
    {loading ? (
      <div className="w-full">
        <CardSkeleton />
      </div>
    ) : (
      <>
        {icon}
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </>
    )}
  </div>
);

export default AttendanceRecord;