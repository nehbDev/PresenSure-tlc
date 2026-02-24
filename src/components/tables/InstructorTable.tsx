import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface Instructor {
  id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  department?: string;
  profile?: { image_link: string } | null;
  status?: string;
}

interface Props {
  instructors: Instructor[];
  loading: boolean;
}

// 1. Added your CustomPagination component here
const CustomPagination = ({
  currentPage,
  rowsPerPage,
  rowCount,
  onChangePage,
}: any) => {
  const totalPages = Math.ceil(rowCount / rowsPerPage);

  return (
    <div className="flex flex-wrap items-center justify-between mt-3 px-2 gap-2 pb-2">
      <button
        onClick={() => onChangePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
      >
        Prev
      </button>

      <span className="text-sm font-medium text-gray-600">
        Page {currentPage} of {totalPages || 1}
      </span>

      <button
        onClick={() => onChangePage(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

const InstructorTable: React.FC<Props> = ({ instructors, loading }) => {
  const navigate = useNavigate();

  const columns: TableColumn<Instructor>[] = [
    {
      name: "PROFILE",
      cell: (row) => (
        <div className="py-2">
            <img
              src={row.profile?.image_link || noProfile}
              alt={`${row.firstname} ${row.lastname}`}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
        </div>
      ),
      center: true,
      width: "100px", 
    },
    {
      name: "INSTRUCTOR ID",
      selector: (row) => row.id || "N/A",
      width: "160px", 
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.middle_initial ? ` ${row.middle_initial}` : ""
        }`,
      grow: 1, 
      wrap: true, 
    },
    {
      name: "DEPARTMENT",
      selector: (row) => row.department || "N/A",
      grow: 1, 
      wrap: true,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-2 rounded-full hover:bg-[#4a5294] transition-colors shadow-sm"
          onClick={() => {
            navigate(`/instructors/instructor-details?id=${row.id}`);
          }}
          title="View Details"
        >
          <FaAngleRight className="w-4 h-4" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "100px", 
      center: true,
    },
  ];

  const customStyles: TableStyles = {
    headRow: {
      style: {
        backgroundColor: "blue",
        color: "white",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        minHeight: "50px",
      },
    },
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "700",
        textTransform: "uppercase",
        paddingLeft: "16px",
        paddingRight: "16px",
        color: "white",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#334155",
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f1f5f9",
          cursor: "pointer",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
  };

  if (loading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {[...Array(5)].map((_, i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200">
      <Toaster position="top-center" />
      <DataTable
        columns={columns}
        data={instructors}
        customStyles={customStyles}
        pagination
        paginationPerPage={10} // 2. Added default rows per page
        paginationComponent={CustomPagination} // 3. Connected your custom component
        highlightOnHover
        striped
        responsive
        noDataComponent={
          <div className="text-center p-10">
            <p className="text-gray-500 text-lg font-medium">No instructors found.</p>
          </div>
        }
      />
    </div>
  );
};

export default InstructorTable;