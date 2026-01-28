import React, { useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaTrashRestore, FaBookOpen } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton";
import apiService from "../../services/ApiService";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import RestoreCourseModal from "../modals/RestoreCourseModal";
import noProfile from "../../assets/noProfile.webp"; 

interface ArchivedCourse {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
  deleted_at: string;
  instructor: string;
  instructor_image?: string;
}

interface Props {
  courses: ArchivedCourse[];
  loading: boolean;
}

const CustomPagination = ({
  currentPage,
  rowsPerPage,
  rowCount,
  onChangePage,
}: any) => {
  const totalPages = Math.ceil(rowCount / rowsPerPage);
  return (
    <div className="flex items-center justify-between mt-3 px-2">
      <button
        onClick={() => onChangePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onChangePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium"
      >
        Next
      </button>
    </div>
  );
};

const ArchiveCourseTable: React.FC<Props> = ({ courses, loading }) => {
  const queryClient = useQueryClient();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handlers
  const openRestoreModal = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedId) return;

    try {
      setIsRestoring(true);
      await apiService.post(`/course/${selectedId}/restore`, {});
      toast.success("Course restored successfully");

      queryClient.invalidateQueries({ queryKey: ["archived_courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses_active_semester"] });

      setModalOpen(false);
    } catch (error: any) {
      console.error("Restore failed", error);
      toast.error(error.response?.data?.message || "Failed to restore course");
    } finally {
      setIsRestoring(false);
      setSelectedId(null);
    }
  };

  // --- STYLING ---
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        padding: "8px 12px",
        backgroundColor: "blue",
        color: "white",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "8px 12px",
        textAlign: "left",
      },
    },
    headRow: {
      style: {
        width: "100%",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        overflow: "hidden",
      },
    },
  };

  // --- COLUMNS (Units Removed) ---
  const columns: TableColumn<ArchivedCourse>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.subject_code,
      sortable: true,
      width: "20%",
      style: { textAlign: "left", fontWeight: "bold" },
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description,
      sortable: true,
      width: "40%", 
      wrap: true,
      style: { textAlign: "left" },
    },
    {
      name: "INSTRUCTOR",
      width: "30%",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
            {/* Avatar Image */}
            <div className="flex-shrink-0">
                <img 
                    src={row.instructor_image || noProfile} 
                    alt="Instructor" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
            </div>
            {/* Name */}
            <span className="font-medium text-gray-700">
                {row.instructor || "TBA"}
            </span>
        </div>
      ),
      style: { textAlign: "left" },
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          onClick={() => openRestoreModal(row.course_id)}
          className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Restore Course"
        >
          <FaTrashRestore className="w-4 h-4" />
        </button>
      ),
      button: true,
      width: "10%",
      style: { textAlign: "center" },
    },
  ];

  const selectedCourse = courses.find((c) => c.course_id === selectedId);

  return (
    <>
      <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <TableSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationComponent={CustomPagination}
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="p-8 text-center text-gray-500">
                <FaBookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No archived courses found.</p>
              </div>
            }
          />
        )}
      </div>

      <RestoreCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Course"
        message={
          <>
            Are you sure you want to restore{" "}
            <strong>
              {selectedCourse?.subject_code}
            </strong>
            ?
          </>
        }
        confirmText="Yes, Restore"
        variant="success"
        isLoading={isRestoring}
      />
    </>
  );
};

export default ArchiveCourseTable;