import React, { useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaTrashRestore, FaUserTie } from "react-icons/fa"; // Changed icon to UserTie for instructors
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton";
import apiService from "../../services/ApiService";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import RestoreInstructorModal from "../modals/RestoreInstructorModal";

interface ArchivedInstructor {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex?: string;
  department?: string;
  profile?: {
    image_link: string;
  };
}

interface Props {
  instructors: ArchivedInstructor[];
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

const ArchiveInstructorTable: React.FC<Props> = ({ instructors, loading }) => {
  const queryClient = useQueryClient();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handlers
  const openRestoreModal = (id: string) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedId) return;

    try {
      setIsRestoring(true);
      // FIXED TYPO: Changed '/insttructor/' to '/instructor/'
      await apiService.post(`/instructor/${selectedId}/restore`, {});
      toast.success("Instructor restored successfully");

      // Invalidate both Archive and Active lists to refresh UI
      queryClient.invalidateQueries({ queryKey: ["archived_instructors"] });
      queryClient.invalidateQueries({ queryKey: ["instructors"] });

      setModalOpen(false);
    } catch (error: any) {
      console.error("Restore failed", error);
      toast.error(error.response?.data?.message || "Failed to restore instructor");
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
        backgroundColor: "#2563eb", // Blue-600
        color: "white",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "8px 12px",
        textAlign: "center",
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

  const columns: TableColumn<ArchivedInstructor>[] = [
    {
      name: "PROFILE",
      cell: (row) => (
        <div className="">
          <img
            src={row.profile?.image_link || noProfile}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      ),
      center: true,
      width: "10%",
    },
    {
      name: "INSTRUCTOR ID",
      selector: (row) => row.user_id || "N/A",
      sortable: true,
      width: "20%",
      style: { textAlign: "left" },
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.suffix ? ` ${row.suffix}` : ""
        }${row.middle_initial ? ` ${row.middle_initial}.` : ""}`,
      sortable: true,
      width: "30%",
      style: { textAlign: "left" },
    },
    {
      name: "DEPARTMENT",
      selector: (row) => row.department || "N/A",
      sortable: true,
      width: "25%",
      style: { textAlign: "left" },
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          onClick={() => openRestoreModal(row.user_id)}
          className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Restore Instructor"
        >
          <FaTrashRestore className="w-4 h-4" />
        </button>
      ),
      button: true,
      width: "15%",
    },
  ];

  const selectedInstructor = instructors.find((s) => s.user_id === selectedId);

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
            data={instructors}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationComponent={CustomPagination}
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="p-8 text-center text-gray-500">
                <FaUserTie className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No archived instructors found.</p>
              </div>
            }
          />
        )}
      </div>

      <RestoreInstructorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Instructor"
        message={
          <>
            Are you sure you want to restore{" "}
            <strong>
              {selectedInstructor?.firstname} {selectedInstructor?.lastname}
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

export default ArchiveInstructorTable;