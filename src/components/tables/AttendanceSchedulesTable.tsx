import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type TableColumn, type TableStyles } from "react-data-table-component";
import { FaClock, FaAngleRight } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton"; // 1. Import Skeleton

// --- Interfaces ---
export interface SessionStats {
  total_students: number;
  present: number;
  late: number;
  absent: number;
}

export interface SessionData {
  session_id: number;
  date: string;
  day: string;
  time: string;
  type: string;
  room: string;
  status: string;
  stats: SessionStats;
}

interface AttendanceSchedulesTableProps {
  data: SessionData[];
  loading: boolean;
}

const AttendanceSchedulesTable: React.FC<AttendanceSchedulesTableProps> = ({ data, loading }) => {
  const navigate = useNavigate();

  const columns: TableColumn<SessionData>[] = [
    {
      name: "DATE",
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-gray-800 text-sm">{row.date}</span>
          <span className="text-xs text-gray-500">{row.day}</span>
        </div>
      ),
      width: "180px",
    },
    {
      name: "TYPE",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.type === "Lecture"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {row.type}
        </span>
      ),
      width: "150px",
    },
    {
      name: "TIME & ROOM",
      cell: (row) => (
        <div className="flex items-center text-xs gap-3">
          <div className="flex items-center gap-1 font-medium text-gray-700">
            <FaClock /> {row.time}
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Room: {row.room || "N/A"}</span>
        </div>
      ),
    },
    {
      name: "ACTION",
      center: true,
      width: "100px",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1.5 rounded-full hover:bg-[#A9B5DF] transition-colors"
          onClick={() => navigate(`/records/session/${row.session_id}`)}
        >
          <FaAngleRight />
        </button>
      ),
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        backgroundColor: "blue",
        color: "white",
        fontSize: "13px",
        fontWeight: "700",
      },
    },
    rows: { style: { minHeight: "60px" } },
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      {loading ? (
        // 2. Use the Skeleton Loop here
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          highlightOnHover
          striped
          noDataComponent={<div className="p-8 text-gray-500">No session history found.</div>}
        />
      )}
    </div>
  );
};

export default AttendanceSchedulesTable;