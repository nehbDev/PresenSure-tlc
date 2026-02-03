import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaCloudUploadAlt,
  FaArchive,
} from "react-icons/fa";
import StudentTable from "../components/tables/StudentTable";
import Breadcrumbs from "../layout/Breadcrumbs";
import CardSkeleton from "../components/contentLoader/CardSkeleton";
import { useQuery } from "@tanstack/react-query";

// ... [Keep your programsByDepartment, interfaces, and DropdownFilter exactly the same] ...
// Organize programs by department
const programsByDepartment = {
  "College of Business Education": [
    "BSBA-MM",
    "BSBA-FM",
    "BSBA-OM",
    "BSEntrep",
  ],
  "College of Teacher Education": ["BEED", "BSed-English", "BSed-Mathematics"],
  "College of Computer Studies": ["BSIT", "ACT"],
};

const allDepartments = Object.keys(programsByDepartment);
const allPrograms = Object.values(programsByDepartment).flat();

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex?: string;
  avatar?: string;
  program?: string;
  year_level?: string;
  block?: string;
  enrolled?: boolean;
  todayReg?: boolean;
  image?: string;
  profile?: {
    image_link: string;
  };
  [key: string]: any;
}

interface ApiResponse {
  status: string;
  data: Student[];
  counts?: {
    total_students: number;
    registered_students: number;
    unregistered_students: number;
  };
}

const yearOrder = ["First Year", "Second Year", "Third Year", "Fourth Year"];

const DropdownFilter: React.FC<{
  label: string;
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
  fixedWidth?: string;
}> = ({ label, options, selected, setSelected, fixedWidth }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center min-h-[42px] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 whitespace-nowrap ${
          fixedWidth ? fixedWidth : "min-w-[120px] max-w-[180px]"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="truncate text-left flex-1">
          {selected || `${label}`}
        </span>
        <svg
          className="ml-2 h-5 w-5 text-gray-400 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`origin-top-right absolute z-20 mt-1 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            fixedWidth ? fixedWidth : "min-w-[120px] max-w-[180px]"
          }`}
        >
          <ul
            className="py-1 text-sm text-gray-700 max-h-60 overflow-y-auto"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <li
              className={`block px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === "" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => {
                setSelected("");
                setOpen(false);
              }}
              role="menuitem"
            >
              All
            </li>
            {options.map((option) => (
              <li
                key={option}
                className={`block px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selected === option ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                role="menuitem"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Student: React.FC = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"enrolled" | "not-enrolled">(
    "enrolled"
  );

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") ?? "guest";

  const crumbs = [{ label: "Students" }];
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false);

  // --- QUERY LOGIC WITH DEBUGGERS ---
  const {
    data: apiResponse,
    isLoading,
    isFetching, // Tells us if a network request is flying right now
    isStale,    // Tells us if the data is considered "old"
    isError,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      // DEBUGGER 1: This logs ONLY when the API is actually hit
      console.log(`%c[Network] Fetching fresh student data at ${new Date().toLocaleTimeString()}`, "color: #00ff00; font-weight: bold;");
      
      const response = await apiService.get<ApiResponse>("/students");
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 1 Minute for testing
    retry: 1,
  });

  // DEBUGGER 2: Monitor fetching state (Start vs Finish)
  useEffect(() => {
    if (isFetching) {
      console.log(`%c[Status] Background update STARTED...`, "color: orange");
    } else if (!isLoading) {
      console.log(`%c[Status] Background update FINISHED or Idle.`, "color: gray");
    }
  }, [isFetching, isLoading]);

  // DEBUGGER 3: Monitor Expiration (When does data turn rotten?)
  useEffect(() => {
    if (isStale) {
      console.log(`%c[Cache] Data is now STALE (Expired). Next window focus will trigger refetch.`, "color: red; font-weight: bold");
    } else {
      console.log(`%c[Cache] Data is FRESH. No refetch needed yet.`, "color: cyan");
    }
  }, [isStale]);

  // --- END DEBUGGERS ---

  const students = apiResponse?.data || [];
  const loading = isLoading;
  const counts = apiResponse?.counts || {
    total_students: 0,
    registered_students: 0,
    unregistered_students: 0,
  };

  useEffect(() => {
    if (isError) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    }
  }, [isError, error]);

  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage]);

  const availablePrograms = departmentFilter
    ? programsByDepartment[
        departmentFilter as keyof typeof programsByDepartment
      ] || []
    : allPrograms;

  useEffect(() => {
    setProgramFilter("");
  }, [departmentFilter]);

  const yearOptions: string[] = Array.from(
    new Set(students.map((s) => s.year_level).filter((v): v is string => !!v))
  ).sort((a, b) => {
    const ixA = yearOrder.indexOf(a);
    const ixB = yearOrder.indexOf(b);
    if (ixA !== -1 && ixB !== -1) return ixA - ixB;
    if (ixA !== -1) return -1;
    if (ixB !== -1) return 1;
    return a.localeCompare(b);
  });

  const blockRaw: string[] = Array.from(
    new Set(students.map((s) => s.block).filter((v): v is string => !!v))
  );
  const blockOptions = ["C", ...blockRaw.filter((b) => b !== "C")].sort();

  const filteredStudents = students.filter((student) => {
    const matchFilters =
      (departmentFilter
        ? programsByDepartment[
            departmentFilter as keyof typeof programsByDepartment
          ]?.includes(student.program || "")
        : true) &&
      (programFilter ? student.program === programFilter : true) &&
      (yearFilter ? student.year_level === yearFilter : true) &&
      (blockFilter ? student.block === blockFilter : true) &&
      (search
        ? `${student.lastname} ${student.firstname} ${
            student.middle_initial ?? ""
          } ${student.suffix ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          student.user_id.toLowerCase().includes(search.toLowerCase())
        : true);

    const matchTab =
      activeTab === "enrolled" ? !!student.enrolled : !student.enrolled;

    return matchFilters && matchTab;
  });

  const totalCount = counts.total_students;
  const registeredCount = counts.registered_students;
  const unregisteredCount = counts.unregistered_students;

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          icon={<FaUsers className="text-blue-600 text-4xl" />}
          label="Total Students"
          value={totalCount.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaUserCheck className="text-blue-600 text-4xl" />}
          label="Registered Students"
          value={registeredCount.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaUserTimes className="text-blue-600 text-4xl" />}
          label="Unregistered Students"
          value={unregisteredCount.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
      </div>

      {/* Tabs & action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 space-y-4 md:space-y-0">
        <div className="flex space-x-6">
          {(["enrolled", "not-enrolled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 py-2 text-sm font-semibold cursor-pointer transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-600 hover:text-blue-600"
              }`}
              style={{ minHeight: 38 }}
            >
              {tab === "enrolled" ? "Registered" : "Unregistered"}
            </button>
          ))}
        </div>
        {userRole !== "instructor" && (
          <div className="flex justify-end items-center space-x-2">
            <button
              onClick={() => navigate("/students/bulk-registration")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaUsers className="mr-1 h-5 w-5" />
              Bulk Registration
            </button>
            <button
              onClick={() => navigate("/students/bulk-image-upload")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaCloudUploadAlt className="mr-1 h-5 w-5" />
              Upload Images
            </button>
            <button
              onClick={() => navigate("/students/manual-registration")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaUserPlus className="mr-1 h-5 w-5" />
              Single Registration
            </button>

            <button
              onClick={() => navigate("/students/archives")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaArchive className="mr-1 h-5 w-5" />
              View Archives
            </button>
          </div>
        )}
      </div>

      {/* Filter dropdowns & search */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-md shadow-sm border border-gray-200">
        {/* Department Filter */}
        <div className="min-h-[42px] flex-shrink-0 w-64">
          <DropdownFilter
            label="Department"
            options={allDepartments}
            selected={departmentFilter}
            setSelected={setDepartmentFilter}
            fixedWidth="w-64"
          />
        </div>

        {/* Program Filter */}
        <div className="min-h-[42px] flex-shrink-0">
          <DropdownFilter
            label="Program"
            options={availablePrograms}
            selected={programFilter}
            setSelected={setProgramFilter}
          />
        </div>

        {/* Year Filter */}
        <div className="min-h-[42px] flex-shrink-0">
          <DropdownFilter
            label="Year"
            options={yearOptions}
            selected={yearFilter}
            setSelected={setYearFilter}
          />
        </div>

        {/* Block Filter */}
        <div className="min-h-[42px] flex-shrink-0">
          <DropdownFilter
            label="Block"
            options={blockOptions}
            selected={blockFilter}
            setSelected={setBlockFilter}
          />
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px] min-h-[42px]">
          <div className="relative flex items-center h-full">
            <label htmlFor="search" className="sr-only">
              Search students
            </label>
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="search"
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Student table */}
      <StudentTable students={filteredStudents} loading={loading} />
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

export default Student;