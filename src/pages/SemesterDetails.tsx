import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { FaCalendarAlt, FaClock, FaEdit, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import SemesterDetailsSkeleton from "../components/contentLoader/SemesterDetailsSkeleton";

interface Period {
  period_id: number;
  name: string;
  start_date: string;
  end_date: string;
}

interface SemesterDetailsData {
  semester_id: number;
  description: string;
  status: "active" | "inactive";
  schoolyear_start: number;
  schoolyear_end: number;
  semester_start: string;
  semester_end: string;
  periods: Period[];
}

const SemesterDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");

  const crumbs = [
    { label: "Semesters", to: "/semester" },
    { label: "Semester Details" },
  ];

  const { data: semester, isLoading, isError } = useQuery({
    queryKey: ["semester_details", id],
    queryFn: async () => {
      const response = await apiService.get<{ data: SemesterDetailsData }>(`/semester/${id}/details`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Breadcrumbs crumbs={crumbs} />
      <SemesterDetailsSkeleton />
    </div>
  );

  if (isError || !semester) return <div className="p-10 text-center text-red-500">Semester not found.</div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <Breadcrumbs crumbs={crumbs} />

      {/* --- Semester Header Card --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">{semester.description}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                semester.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {semester.status}
              </span>
            </div>
            <p className="text-lg text-gray-500 mt-1">
              School Year: {semester.schoolyear_start} - {semester.schoolyear_end}
            </p>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 bg-blue-50 w-fit px-3 py-1 rounded border border-blue-100">
              <FaCalendarAlt className="text-blue-600" />
              <span className="font-medium">Duration:</span>
              {formatDate(semester.semester_start)} — {formatDate(semester.semester_end)}
            </div>
          </div>

          <button 
            onClick={() => navigate(`/semester/edit?id=${semester.semester_id}`)}
            className="flex items-center bg-blue-600 px-4 py-2 text-white text-sm rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            <FaEdit className="mr-2 h-4 w-4" />
            Edit Semester
          </button>
        </div>
      </div>

      {/* --- Academic Periods Timeline --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaClock className="text-blue-600" />
          Academic Periods Setup
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {semester.periods.map((period, index) => {
            const isToday = new Date() >= new Date(period.start_date) && new Date() <= new Date(period.end_date);
            
            return (
              <div 
                key={period.period_id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Period {index + 1}
                  </span>
                  {isToday ? (
                    <FaCheckCircle className="text-blue-500 h-4 w-4" title="Current Active Period" />
                  ) : (
                    <FaRegCircle className="text-gray-300 h-4 w-4" />
                  )}
                </div>
                
                <h4 className="text-lg font-bold text-gray-800 mb-3">{period.name}</h4>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">Start Date</p>
                    <p>{formatDate(period.start_date)}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">End Date</p>
                    <p>{formatDate(period.end_date)}</p>
                  </div>
                </div>

                {isToday && (
                  <div className="mt-4 text-[10px] font-bold text-center py-1 bg-blue-500 text-white rounded uppercase tracking-tighter">
                    Currently Active
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SemesterDetails;