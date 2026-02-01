import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import apiService from "../../services/ApiService";
import StudentsTableSelectable from "../tables/studentTablebulkRemove";
import ConfirmationModal from "../modals/RemoveStudentConfirmation";
// ✅ Import the custom TableSkeleton
import TableSkeleton from "../contentLoader/TableSkeleton";

interface Course {
  course_id: number;
  subject_code: string;
  description: string;
  users: any[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

const BulkRemoveStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Selection and Search
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // --- Filter Logic ---
  const filteredStudents = course?.users.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
    const studentId = student.user_id.toLowerCase();

    return fullName.includes(searchLower) || studentId.includes(searchLower);
  }) || [];

  // --- Handlers ---
  const handleToggleSelect = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleToggleAll = () => {
    const visibleIds = filteredStudents.map((s) => s.user_id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const newSelected = new Set([...selectedIds, ...visibleIds]);
      setSelectedIds(Array.from(newSelected));
    }
  };

  const handleRemoveClick = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setIsModalOpen(true);
  };

  const executeRemoval = async () => {
    try {
      setIsSubmitting(true);
      const response: any = await apiService.post("/bulk-remove-students", {
        course_id: id,
        user_ids: selectedIds,
      });

      toast.success(response.data.message || "Students removed successfully.");
      setIsModalOpen(false);
      
      setTimeout(() => {
        navigate(`/mySchedule/subject/${id}`);
      }, 1000);

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to remove students.";
      toast.error(msg);
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        crumbs={[
          { label: "My Schedule", to: "/mySchedule" },
          { label: course ? course.subject_code : "Subject", to: `/mySchedule/subject/${id}` },
          { label: "Bulk Remove" },
        ]}
      />
      <Toaster position="top-right" />

      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-600 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Bulk Remove Students</h1>
        <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">
                Total Enrolled: {loading ? "..." : (course?.users?.length || 0)}
            </span>
            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                {selectedIds.length} Selected
            </span>
        </div>
      </div>

      {/* Search & Table Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Name or Student ID..."
            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2 border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading} // Disable search while loading
          />
        </div>

        {/* ✅ Updated Loading State: Use TableSkeleton */}
        {loading ? (
          <div className="w-full">
            {/* Render 5 skeleton rows to simulate loading content */}
            {[...Array(5)].map((_, i) => (
              <TableSkeleton key={i} />
            ))}
          </div>
        ) : (
          <StudentsTableSelectable
            data={filteredStudents}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          
          <button
            onClick={handleRemoveClick} 
            disabled={isSubmitting || selectedIds.length === 0 || loading}
            className={`px-6 py-2 text-white font-medium rounded shadow-sm transition flex items-center gap-2 ${
              isSubmitting || selectedIds.length === 0 || loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Remove Selected
          </button>
        </div>
      </div>

      {/* Modal Implementation */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        onConfirm={executeRemoval}
        title="Confirm Removal"
        message={
          <div>
            <p>Are you sure you want to remove <strong>{selectedIds.length}</strong> student(s) from this course?</p>
          </div>
        }
        confirmText="Yes, Remove Students"
        cancelText="Cancel"
        type="danger"
        isProcessing={isSubmitting}
      />
    </div>
  );
};

export default BulkRemoveStudents;