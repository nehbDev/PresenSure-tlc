import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";

interface Course {
  id: number;
  course_code: string;
  description: string;
  instructor: string;
  units: number;
  schedule: string;
  students_count: number;
  attendance_taken: number;
}

interface Props {
  courses: Course[];
  loading: boolean;
  onViewAttendance: (courseId: number) => void;
  onTakeAttendance: (courseId: number) => void;
}

const AttendanceScheduleTable: React.FC<Props> = ({
  courses,
  loading,
  onViewAttendance,
}) => {
  const columns: TableColumn<Course>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.course_code || "",
      wrap: true,
      center: true,
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description || "",
      wrap: true,
      style: {
        textAlign: "left",
      },
    },
    {
      name: "INSTRUCTOR",
      selector: (row) => row.instructor || "TBA",
      wrap: true,
      style: {
        textAlign: "left",
      },
    },
    {
      name: "STUDENTS",
      selector: (row) => row.students_count.toString(),
      center: true,
    },
    {
      name: "ATTENDANCE",
      selector: (row) => `${row.attendance_taken} sessions`,
      center: true,
    },
    // In your AttendanceScheduleTable component, update the action button:
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1 text-xs rounded-full hover:bg-[#A9B5DF]"
          onClick={() => onViewAttendance(row.id)}
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
        padding: "12px 16px",
        backgroundColor: "blue",
        color: "white",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "12px 16px",
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

  return (
    <div>
      {loading ? (
        <p className="text-sm text-gray-600 py-4">Loading courses...</p>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          highlightOnHover
          striped
          dense
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              No courses found
            </div>
          }
        />
      )}
    </div>
  );
};

export default AttendanceScheduleTable;
