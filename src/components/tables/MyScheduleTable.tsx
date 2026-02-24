import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight, FaClock, FaMapMarkerAlt } from "react-icons/fa"; 
import TableSkeleton from "../contentLoader/TableSkeleton";

export interface Schedule {
  id: number;
  schedule_type: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
}

export interface Subject {
  id: number;
  course_id: number;
  subject_code: string;
  description: string;
  schedules: Schedule[];
}

interface Props {
  subjects: Subject[];
  loading: boolean;
  onViewSubject: (courseId: number) => void;
  searchTerm?: string;
}

const formatTime = (time: string) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${m} ${ampm}`;
};

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

const MyScheduleTable: React.FC<Props> = ({
  subjects,
  loading,
  onViewSubject,
  searchTerm,
}) => {
  const columns: TableColumn<Subject>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.subject_code,
      sortable: true,
      grow: 1,
      minWidth: "150px",
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      grow: 2,
      minWidth: "250px",
    },
    {
      name: "SCHEDULES",
      cell: (row) =>
        row.schedules?.length ? (
          <div className="flex flex-col gap-1.5 py-2 w-full">
            {row.schedules.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 text-[13px] text-gray-700 whitespace-nowrap"
              >
                {/* 1. Fixed width (w-[85px]) and centered text so all badges match perfectly */}
                <span className="font-bold text-[#2D336B] uppercase text-[10px] tracking-wider bg-blue-100/60 px-1.5 py-0.5 rounded border border-blue-200 shrink-0 w-[85px] text-center">
                  {s.schedule_type}
                </span>

                <div className="flex items-center gap-2">
                  {/* 2. Fixed width for days so the pipe '|' separators align perfectly vertically */}
                  <span className="text-blue-900 font-bold w-12">{s.days}</span>
                  
                  <span className="text-gray-300">|</span>
                  
                  {/* 3. Fixed width for time so the rooms align perfectly vertically */}
                  <span className="flex items-center gap-1.5 w-[145px]">
                    <FaClock className="text-blue-500 w-3.5 h-3.5 shrink-0" />
                    {formatTime(s.start_time)} - {formatTime(s.end_time)}
                  </span>
                  
                  <span className="text-gray-300">|</span>
                  
                  {/* Room */}
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-red-500 w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.room}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2">
            <span className="text-gray-500 text-sm italic">
              No schedules assigned
            </span>
          </div>
        ),
      grow: 3, 
      minWidth: "400px", // Slightly increased to ensure the neat line doesn't get squished
    },
    {
      name: "ACTIONS",
      cell: (row) => {
        const courseId = row.course_id || row.id;
        return (
          <button
            onClick={() => onViewSubject(courseId)}
            className="flex items-center justify-center bg-[#2D336B] text-white p-2 rounded-full hover:bg-[#A9B5DF] transition-colors shadow-sm"
            aria-label="View Subject"
          >
            <FaAngleRight className="w-4 h-4" />
          </button>
        );
      },
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "100px",
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
        fontWeight: "bold",
        padding: "12px 16px",
        color: "white",
        textTransform: "uppercase",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "12px 16px",
      },
    },
    rows: {
      style: {
        minHeight: "50px", // Reduced minimum height slightly to keep rows compact
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {[...Array(5)].map((_, i) => (
          <TableSkeleton key={i} height={50} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
      <DataTable
        columns={columns}
        data={subjects} 
        customStyles={customStyles}
        pagination
        paginationPerPage={10}
        paginationComponent={CustomPagination}
        highlightOnHover
        responsive
        striped
        noDataComponent={
          <div className="p-10 text-center text-gray-500 text-lg">
            {searchTerm ? "No subjects match your search." : "No subjects found."}
          </div>
        }
      />
    </div>
  );
};

export default MyScheduleTable;