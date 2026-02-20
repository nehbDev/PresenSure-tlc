import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton";
import { useNavigate } from "react-router-dom";

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex?: string;
  program?: string;
  year_level?: string;
  block?: string;
  profile?: {
    image_link: string;
  };
}

interface Props {
  students: Student[];
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
    <div className="flex flex-wrap items-center justify-between mt-3 px-2 gap-2">
      <button
        onClick={() => onChangePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onChangePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const StudentTable: React.FC<Props> = ({ students, loading }) => {
  const navigate = useNavigate();

  const columns: TableColumn<Student>[] = [
    {
      name: "PROFILE",
      cell: (row) =>
        row.profile?.image_link ? (
          <img
            src={row.profile.image_link}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <img
            src={noProfile}
            alt="No Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ),
      center: true,
      width: "80px", // Fixed width for image
      minWidth: "80px",
    },
    {
      name: "STUDENT ID",
      selector: (row) => row.user_id || "N/A",
      minWidth: "140px", // Force minimum width to prevent wrapping
      style: {
        textAlign: "left",
      },
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.suffix ? ` ${row.suffix}` : ""
        }${row.middle_initial ? ` ${row.middle_initial}` : ""}`,
      style: {
        textAlign: "left",
      },
      minWidth: "250px", // Wide minimum width ensures it takes space on mobile
      grow: 2, // Takes up remaining space on Desktop
      wrap: true, 
    },
    {
      name: "SEX",
      selector: (row) => row.sex || "N/A",
      style: {
        textAlign: "left",
      },
      minWidth: "100px",
    },
    {
      name: "PROGRAM",
      selector: (row) => row.program || "N/A",
      style: {
        textAlign: "left",
      },
      minWidth: "100px",
    },
    {
      name: "YEAR LEVEL",
      selector: (row) => row.year_level || "N/A",
      style: {
        textAlign: "left",
      },
      minWidth: "120px",
    },
    {
      name: "BLOCK",
      selector: (row) => row.block || "N/A",
      center: true,
      minWidth: "80px",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1.5 rounded-full hover:bg-[#4a5294] transition-colors shadow-sm"
          onClick={() => {
            navigate(`/students/student-details?id=${row.user_id}`);
          }}
          title="View Details"
        >
          <FaAngleRight className="w-4 h-4" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "80px",
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        padding: "8px 12px",
        backgroundColor: "blue",
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

  return (
    // Added overflow-x-auto here to ensure the container allows scrolling
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 overflow-x-auto">
      {loading ? (
        <>
          {[...Array(5)].map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </>
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
          responsive // This enables the library's internal scroll wrapper
        />
      )}
    </div>
  );
};

export default StudentTable;