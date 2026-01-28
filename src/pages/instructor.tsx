import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUsers,
  FaUserPlus,
  FaCloudUploadAlt,
  FaArchive, // Added Archive Icon
} from "react-icons/fa";
import InstructorTable from "../components/tables/InstructorTable";
import Breadcrumbs from "../layout/Breadcrumbs";
import CardSkeleton from "../components/contentLoader/CardSkeleton"; // Added Skeleton
import { useQuery } from "@tanstack/react-query"; // Added useQuery

const allDepartments = [
  "College of Computer Studies",
  "College of Teacher Education",
  "College of Business Education",
];

// --- Updated DropdownFilter to match Student.tsx style ---
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
          fixedWidth ? fixedWidth : "min-w-[120px] max-w-[250px]"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="truncate text-left flex-1">
          {selected || `Select ${label}`}
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
            fixedWidth ? fixedWidth : "min-w-[120px] max-w-[250px]"
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

interface Instructor {
  id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  department?: string;
  profile?: { image_link: string };
  status?: string;
}

interface InstructorListResponse {
  data: Instructor[];
}

const Instructor: React.FC = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "guest";

  // --- QUERY LOGIC (Matches Student.tsx) ---
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      console.log(
        `%c[Network] Fetching instructor data...`,
        "color: #00ff00; font-weight: bold;"
      );
      const response = await apiService.get<InstructorListResponse>(
        "/getInstructor"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 5 minutes
    retry: 1,
  });

  const instructors = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
  const loading = isLoading;

  useEffect(() => {
    if (isError) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to fetch instructors");
    }
  }, [isError, error]);

  // Filtering Logic
  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch = search
      ? `${inst.lastname} ${inst.firstname} ${inst.middle_initial ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        inst.id.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesDept = departmentFilter
      ? inst.department === departmentFilter
      : true;
    return matchesSearch && matchesDept;
  });

  // Calculate Counts
  const totalInstructors = instructors.length;
  // If you want to show "Active" count separately, use this:
  // const activeInstructors = instructors.filter(inst => inst.status === "active").length; 
  const imagePending = instructors.filter(
    (inst) => !inst.profile?.image_link
  ).length;

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={[{ label: "Instructors" }]} />

      {/* Summary cards - Added loading prop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          icon={<FaUsers className="text-blue-600 text-4xl" />}
          label="Total Instructors"
          value={totalInstructors.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
        <Card
          icon={<FaCloudUploadAlt className="text-blue-600 text-4xl" />}
          label="Image Pending"
          value={imagePending.toString()}
          colorClass="border-blue-600"
          loading={loading}
        />
      </div>

      {/* Actions and Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-end mt-6 space-y-4 md:space-y-0">
        {userRole !== "instructor" && (
          <div className="flex justify-end items-center space-x-2">
            <button
              onClick={() => navigate("/instructors/bulk-registration")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaUsers className="mr-1 h-5 w-5" />
              Bulk Registration
            </button>
            <button
              onClick={() => navigate("/instructors/bulk-image-upload")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaCloudUploadAlt className="mr-1 h-5 w-5" />
              Upload Images
            </button>
            <button
              onClick={() => navigate("/instructors/manual-registration")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaUserPlus className="mr-1 h-5 w-5" />
              Single Registration
            </button>
            {/* Added Archive Button */}
            <button
              onClick={() => navigate("/instructors/archives")}
              className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              style={{ minHeight: 38 }}
            >
              <FaArchive className="mr-1 h-5 w-5" />
              View Archives
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar (Matched Student.tsx styling) */}
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

        {/* Search Input */}
        <div className="flex-1 min-w-[200px] min-h-[42px]">
          <div className="relative flex items-center h-full">
            <label htmlFor="search" className="sr-only">
              Search instructors
            </label>
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="search"
              type="text"
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Instructor table */}
      <InstructorTable instructors={filteredInstructors} loading={loading} />
    </div>
  );
};

// --- Updated Card to support Skeleton Loading ---
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

export default Instructor;