import React, { useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaTrashRestore, FaUser } from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton";
import apiService from "../../services/ApiService";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../modals/restoreStudent";

interface ArchivedStudent {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex?: string;
  profile?: {
    image_link: string;
  };
}

interface Props {
  students: ArchivedStudent[];
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

const ArchiveStudentTable: React.FC<Props> = ({ students, loading }) => {
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
      await apiService.post(`/students/${selectedId}/restore`, {});
      toast.success("Student restored successfully");

      queryClient.invalidateQueries({ queryKey: ["archived_students"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });

      setModalOpen(false);
    } catch (error: any) {
      console.error("Restore failed", error);
      toast.error(error.response?.data?.message || "Failed to restore student");
    } finally {
      setIsRestoring(false);
      setSelectedId(null);
    }
  };

  // --- STYLING (Matched to StudentTable) ---
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        padding: "8px 12px",
        backgroundColor: "blue", // Matched StudentTable Color
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

  const columns: TableColumn<ArchivedStudent>[] = [
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
      name: "STUDENT ID",
      selector: (row) => row.user_id || "N/A",
      sortable: true,
      width: "25%",
      style: { textAlign: "left" }, // Matched alignment
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.suffix ? ` ${row.suffix}` : ""
        }${row.middle_initial ? ` ${row.middle_initial}.` : ""}`,
      sortable: true,
      width: "40%",
      style: { textAlign: "left" }, // Matched alignment
    },
    {
      name: "SEX",
      selector: (row) => row.sex || "N/A",
      width: "10%",
      style: { textAlign: "left" }, // Matched alignment
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          onClick={() => openRestoreModal(row.user_id)}
          // UPDATED CLASSNAME: Circle shape, blue background, centered icon
          className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Restore Student"
        >
          <FaTrashRestore className="w-4 h-4" />
        </button>
      ),
      button: true,
      width: "15%",
    },
  ];

  // Find selected student for modal text
  const selectedStudent = students.find((s) => s.user_id === selectedId);

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
            data={students}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationComponent={CustomPagination}
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="p-8 text-center text-gray-500">
                <FaUser className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No archived students found.</p>
              </div>
            }
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Student"
        message={
          <>
            Are you sure you want to restore{" "}
            <strong>
              {selectedStudent?.firstname} {selectedStudent?.lastname}
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

export default ArchiveStudentTable;
