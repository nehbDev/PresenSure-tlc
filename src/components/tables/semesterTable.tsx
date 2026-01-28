import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate


export interface Semester {
  semester_id: number;
  description: string;
  status: "active" | "inactive";
  schoolyear_start: number;
  schoolyear_end: number;
  semester_start: string;
  semester_end: string;
}

interface Props {
  semesters: Semester[];
  loading: boolean;
}

const SemesterTable: React.FC<Props> = ({ semesters, loading }) => {
    const navigate = useNavigate();

  const columns: TableColumn<Semester>[] = [
    {
      name: "DESCRIPTION",
      selector: (row) => row.description,
      sortable: true,
      center: true,
    },
    {
      name: "STATUS",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
      sortable: true,
      center: true,
    },
    {
      name: "SCHOOL YEAR",
      selector: (row) => `${row.schoolyear_start} - ${row.schoolyear_end}`,
      sortable: true,
      center: true,
    },
    {
      name: "SEMESTER DURATION",
      selector: (row) => {
        const formatDate = (dateStr: string) => {
          const options: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
            year: "numeric",
          };
          let formatted = new Date(dateStr).toLocaleDateString(
            "en-US",
            options,
          );
          // Add a period after the month abbreviation (e.g., "Jun" → "Jun.")
          return formatted.replace(/^([A-Za-z]{3}) /, "$1. ");
        };

        return `${formatDate(row.semester_start)} - ${formatDate(
          row.semester_end,
        )}`;
      },
      sortable: true,
      center: true,
    },

    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1 text-xs rounded-full hover:bg-blue-500 transition-colors"
          onClick={() => navigate(`/semester/details?id=${row.semester_id}`)} // Use your primary key
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
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
      <Toaster position="top-center" />

      {loading ? (
        <>
          {[...Array(5)].map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={semesters}
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped
          dense
        />
      )}
    </div>
  );
};

export default SemesterTable;
