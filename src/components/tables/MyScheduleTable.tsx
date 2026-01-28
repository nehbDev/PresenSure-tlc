import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton"; // ✅ Import the new skeleton

// Schedule model
export interface Schedule {
  id: number;
  schedule_type: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
}

// Subject model
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
}

// Format time -> "08:00:00" => "8:00 AM"
const formatTime = (time: string) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${m} ${ampm}`;
};

const MyScheduleTable: React.FC<Props> = ({
  subjects,
  loading,
  onViewSubject,
}) => {
  // Table columns
  const columns: TableColumn<Subject>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.subject_code,
      sortable: true,
      style: { textAlign: "center" },
      width: "15%",
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      width: "35%",
    },
    {
      name: "SCHEDULES",
      cell: (row) =>
        row.schedules?.length ? (
          <ul className="text-sm list-disc pl-4 py-2">
            {row.schedules.map((s) => (
              <li key={s.id} className="mb-1">
                <span className="font-semibold text-blue-800">
                  {s.schedule_type}:
                </span>{" "}
                {s.days} {formatTime(s.start_time)} - {formatTime(s.end_time)} (
                {s.room})
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 text-sm italic">No schedules</span>
        ),
      wrap: true,
      width: "40%",
    },
    {
      name: "ACTIONS",
      cell: (row) => {
        const courseId = row.course_id || row.id;
        return (
          <button
            onClick={() => onViewSubject(courseId)}
            className="flex items-center justify-center bg-[#2D336B] text-white p-2 rounded-full hover:bg-[#A9B5DF] transition-colors"
            aria-label="View Subject"
          >
            <FaAngleRight className="w-4 h-4" />
          </button>
        );
      },
      style: { textAlign: "center" },
      width: "10%",
    },
  ];

  // Custom table styles
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "bold",
        padding: "12px 16px",
        backgroundColor: "blue", // Light gray header
        color: "white", // Dark gray text
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
        minHeight: "60px", 
      },
    },
  };

  // ✅ Loading State using the new TableSkeleton
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Render 5 skeleton rows */}
        {[...Array(5)].map((_, i) => (
          <TableSkeleton key={i} height={60} />
        ))}
      </div>
    );
  }

  // Empty State
  if (subjects.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">No subjects found.</p>
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
        highlightOnHover
        responsive
        striped
      />
    </div>
  );
};

export default MyScheduleTable;