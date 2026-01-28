import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // ✅ Import React Query
import apiService from "../services/ApiService";
import MyScheduleTable from "../components/tables/MyScheduleTable";
import type { Subject } from "../components/tables/MyScheduleTable";
import Breadcrumbs from "../layout/Breadcrumbs";

// Generic API response interface
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

const MySchedule: React.FC = () => {
  const navigate = useNavigate();
  const crumbs = [{ label: "My Schedules" }];

  // Retrieve user from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- QUERY LOGIC ---
  const {
    data: subjects = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-schedule", user?.id], // Unique key based on user ID
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not found");
      }

      console.log(
        `%c[Network] Fetching schedule at ${new Date().toLocaleTimeString()}`,
        "color: #00ff00; font-weight: bold;"
      );

      const platform = "web";
      const response = await apiService.get<ApiResponse<Subject[]>>(
        `/getUserCoursesAndSchedules?user_id=${user.id}&platform=${platform}`
      );

      // Support both { data: [...] } and plain [...]
      const result = (response.data as any)?.data ?? response.data;
      return result || [];
    },
    enabled: !!user?.id, // Only run query if user ID exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 1,
  });

  // --- DEBUGGERS ---
  useEffect(() => {
    if (isFetching) {
      console.log(`%c[Status] Schedule update STARTED...`, "color: orange");
    } else if (!isLoading) {
      console.log(`%c[Status] Schedule update FINISHED.`, "color: gray");
    }
  }, [isFetching, isLoading]);

  // --- ERROR HANDLING ---
  useEffect(() => {
    if (isError) {
      console.error("Error fetching schedule:", error);
      toast.error("Error fetching schedule");
    }
    if (!user?.id) {
      toast.error("User not found. Please login again.");
    }
  }, [isError, error, user?.id]);

  const handleViewSubject = (courseId: number) => {
    console.log("Navigating to course ID:", courseId);
    navigate(`/mySchedule/subject/${courseId}`);
  };

  return (
    <div className="space-y-4 text-black">
      <Toaster />
      <Breadcrumbs crumbs={crumbs} />
      <MyScheduleTable
        subjects={subjects}
        loading={isLoading}
        onViewSubject={handleViewSubject}
      />
    </div>
  );
};

export default MySchedule;