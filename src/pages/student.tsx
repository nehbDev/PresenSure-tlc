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

// --- Configuration ---
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
const yearOrder = ["First Year", "Second Year", "Third Year", "Fourth Year"];

// --- Interfaces ---
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

// --- Components ---

const DropdownFilter: React.FC<{
  label: string;
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
  minWidth?: string;
}> = ({ label, options, selected, setSelected, minWidth = "140px" }) => {
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
    <div
      className="relative inline-block w-full sm:w-auto"
      ref={containerRef}
      style={{ minWidth }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-between h-[42px] w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="truncate text-left flex-1">
          {selected || `${label}`}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0"
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

      {/* Dropdown Menu - z-index ensures it sits on top */}
      {open && (
        <div className="origin-top-right absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ul
            className="py-1 text-sm text-gray-700 max-h-60 overflow-y-auto"
            role="menu"
          >
            <li
              className={`block px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === "" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => {
                setSelected("");
                setOpen(false);
              }}
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

const Card: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  loading?: boolean;
}> = ({ icon, label, value, colorClass, loading }) => (
  <div
    className={`bg-white border-t-4 ${colorClass} shadow rounded-lg p-4 flex items-center space-x-3 min-w-[240px] flex-shrink-0 h-[100px]`}
  >
    {loading ? (
      <div className="w-full">
        <CardSkeleton />
      </div>
    ) : (
      <>
        {icon}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </>
    )}
  </div>
);

const Student: React.FC = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"enrolled" | "not-enrolled">(
    "enrolled",
  );

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") ?? "guest";
  const crumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Students" },
  ];
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await apiService.get<ApiResponse>("/students");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

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

  let yearOptions: string[] = Array.from(
    new Set(students.map((s) => s.year_level).filter((v): v is string => !!v)),
  ).sort((a, b) => {
    const ixA = yearOrder.indexOf(a);
    const ixB = yearOrder.indexOf(b);
    if (ixA !== -1 && ixB !== -1) return ixA - ixB;
    return a.localeCompare(b);
  });

  if (programFilter === "ACT") {
    yearOptions = yearOptions.filter((y) =>
      ["First Year", "Second Year"].includes(y),
    );
  }

  const blockRaw: string[] = Array.from(
    new Set(students.map((s) => s.block).filter((v): v is string => !!v)),
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

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {/* 1. CARDS */}
      <div className="flex flex-nowrap overflow-x-auto gap-4 pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible custom-scrollbar">
        <Card
          icon={<FaUsers className="text-blue-600 text-3xl" />}
          label="Total Students"
          value={counts.total_students.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaUserCheck className="text-blue-600 text-3xl" />}
          label="Enrolled"
          value={counts.registered_students.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaUserTimes className="text-blue-600 text-3xl" />}
          label="Unenrolled"
          value={counts.unregistered_students.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
      </div>

      {/* 2. TABS & BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
        {/* Tabs */}
        <div className="flex space-x-6 border-b sm:border-none border-gray-200 overflow-x-auto">
          {(["enrolled", "not-enrolled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 sm:px-4 py-2 text-sm font-semibold cursor-pointer transition whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab === "enrolled" ? "Enrolled" : "Unenrolled"}
            </button>
          ))}
        </div>

        {/* Buttons */}
        {userRole !== "instructor" && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => navigate("/students/bulk-registration")}
              className="flex items-center justify-center bg-blue-600 px-3 py-2 text-white text-sm rounded-md hover:bg-blue-500 transition whitespace-nowrap"
            >
              <FaUsers className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Bulk Registration</span>
            </button>
            <button
              onClick={() => navigate("/students/bulk-image-upload")}
              className="flex items-center justify-center bg-blue-600 px-3 py-2 text-white text-sm rounded-md hover:bg-blue-500 transition whitespace-nowrap"
            >
              <FaCloudUploadAlt className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Upload Images</span>
            </button>
            <button
              onClick={() => navigate("/students/manual-registration")}
              className="flex items-center justify-center bg-blue-600 px-3 py-2 text-white text-sm rounded-md hover:bg-blue-500 transition whitespace-nowrap"
            >
              <FaUserPlus className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Single Registration</span>
            </button>
            <button
              onClick={() => navigate("/students/archives")}
              className="flex items-center justify-center bg-blue-600 px-3 py-2 text-white text-sm rounded-md hover:bg-blue-500 transition whitespace-nowrap"
            >
              <FaArchive className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Archives</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* CHANGED: Removed overflow-x-auto.
            Used flex-wrap. This allows dropdowns to "breathe" and sit on top of other content 
            without getting clipped by a scroll container.
          */}
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <DropdownFilter
              label="Department"
              options={allDepartments}
              selected={departmentFilter}
              setSelected={setDepartmentFilter}
              minWidth="200px"
            />
            <DropdownFilter
              label="Program"
              options={availablePrograms}
              selected={programFilter}
              setSelected={setProgramFilter}
              minWidth="140px"
            />
            <DropdownFilter
              label="Year"
              options={yearOptions}
              selected={yearFilter}
              setSelected={setYearFilter}
              minWidth="120px"
            />
            <DropdownFilter
              label="Block"
              options={blockOptions}
              selected={blockFilter}
              setSelected={setBlockFilter}
              minWidth="100px"
            />
          </div>

          {/* Search Bar */}
          <div className="w-full lg:flex-1 min-w-[200px]">
            <div className="relative flex items-center h-[42px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-full pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <StudentTable students={filteredStudents} loading={loading} />
    </div>
  );
};

export default Student;
