import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiService from "../services/ApiService";
import MyScheduleTable from "../components/tables/MyScheduleTable";
import type { Subject } from "../components/tables/MyScheduleTable"; // Used for typing the filter
import Breadcrumbs from "../layout/Breadcrumbs";
import { FaSearch } from "react-icons/fa";

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

const MySchedule: React.FC = () => {
  const navigate = useNavigate();
  const crumbs = [{ label: "My Schedules" }];

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [search, setSearch] = useState("");

  const {
    data: subjects = [],
    isLoading,
    // Removed 'isFetching' to clear the unused variable warning
    isError,
    error,
  } = useQuery({
    queryKey: ["my-schedule", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not found");

      const platform = "web";
      const response = await apiService.get<ApiResponse<Subject[]>>(
        `/getUserCoursesAndSchedules?user_id=${user.id}&platform=${platform}`
      );

      const result = (response.data as any)?.data ?? response.data;
      return result || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Error fetching schedule");
    }
    if (!user?.id) {
      toast.error("User not found. Please login again.");
    }
  }, [isError, error, user?.id]);

  const handleViewSubject = (courseId: number) => {
    navigate(`/mySchedule/subject/${courseId}`);
  };

  // Fixed: Explicitly defined 'subject' as type 'Subject'
  const filteredSubjects = subjects.filter(
    (subject: Subject) =>
      subject.subject_code?.toLowerCase().includes(search.toLowerCase()) ||
      subject.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 text-black">
      <Toaster />
      <Breadcrumbs crumbs={crumbs} />

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-end">
        <div className="relative w-full md:w-96 h-[42px]">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full pl-10 pr-4 rounded-md border border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#2D336B] focus:border-transparent"
          />
        </div>
      </div>

      <MyScheduleTable
        subjects={filteredSubjects}
        loading={isLoading}
        onViewSubject={handleViewSubject}
        searchTerm={search} 
      />
    </div>
  );
};

export default MySchedule;