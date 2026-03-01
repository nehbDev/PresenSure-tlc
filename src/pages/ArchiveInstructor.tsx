import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { FaSearch } from "react-icons/fa";
import ArchiveInstructorTable from "../components/tables/ArchiveInstructorTable"; 
import Breadcrumbs from "../layout/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";

// Instructor Interface matching your Backend Response
interface Instructor {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex?: string;
  department?: string; // Specific to Instructors
  profile?: {
    image_link: string;
  };
  archived_at?: string;
  [key: string]: any;
}

interface ApiResponse {
  status: string;
  data: Instructor[];
}

const ArchiveInstructor: React.FC = () => {
  const [search, setSearch] = useState("");
  const crumbs = [{ label: "Dashboard", to: "/dashboard" },{ label: "Instructors", to: "/instructors" }, { label: "Archives" }];

  // --- QUERY LOGIC ---
  const {
    data: instructors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["archived_instructors"],
    queryFn: async () => {
      // Matches Route: Route::get('/instructors/archives', ...)
      const response = await apiService.get<ApiResponse>("/instructors/archives");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  // Error Handling
  useEffect(() => {
    if (isError) {
      console.error("Error fetching archives:", error);
      toast.error("Error fetching archived instructors");
    }
  }, [isError, error]);

  // Client-side Filter Logic
  const filteredInstructors = instructors.filter((inst) => {
    if (!search) return true;
    const fullName = `${inst.lastname}, ${inst.firstname} ${inst.middle_initial || ""} ${inst.suffix || ""}`.toLowerCase();
    const id = inst.user_id.toLowerCase();
    const dept = (inst.department || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || id.includes(query) || dept.includes(query);
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
              Archived Instructors
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-[300px]">
            <label htmlFor="search" className="sr-only">Search archives</label>
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="search"
              type="text"
              placeholder="Search by name, ID, or Dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table Component */}
        <ArchiveInstructorTable instructors={filteredInstructors} loading={isLoading} />
      </div>
    </div>
  );
};

export default ArchiveInstructor;