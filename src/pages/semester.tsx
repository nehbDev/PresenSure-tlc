import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Breadcrumbs from "../layout/Breadcrumbs";
import { FaCalendarPlus } from "react-icons/fa";
import SemesterTable, {
  type Semester,
} from "../components/tables/semesterTable";
import apiService from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const SemesterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false);

  // Success message toast handling
  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      // Clean up the location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, location.pathname, navigate]);

  const {
    data: semesters = [],
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
  } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      console.log(
        `%c[Network] Fetching semester data at ${new Date().toLocaleTimeString()}`,
        "color: #00ff00; font-weight: bold;",
      );
      const response = await apiService.get<Semester[]>("/semesters");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // --- DEBUGGERS ---
  useEffect(() => {
    if (isFetching) {
      console.log(`%c[Status] Semester update STARTED...`, "color: orange");
    } else if (!isLoading) {
      console.log(
        `%c[Status] Semester update FINISHED or Idle.`,
        "color: gray",
      );
    }
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (isStale) {
      console.log(
        `%c[Cache] Semester data is STALE.`,
        "color: red; font-weight: bold",
      );
    }
  }, [isStale]);

  // Error Handling
  useEffect(() => {
    if (isError) {
      console.error("Error fetching semesters:", error);
      toast.error("Error fetching semesters");
    }
  }, [isError, error]);

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={[{ label: "Semesters" }]} />

      <div className="p-4 grid grid-cols-1 items-center bg-white border-b border-gray-300 rounded-lg shadow-sm text-black">
        <div className="flex justify-end items-center space-x-3">
          <button
            onClick={() => navigate("/semester/create-semester")}
            className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          >
            <FaCalendarPlus className="mr-1 h-4 w-4" />
            Add Semester
          </button>
        </div>
      </div>

      <SemesterTable semesters={semesters} loading={isLoading} />
    </div>
  );
};

export default SemesterPage;
