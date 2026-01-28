import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
// 1. Import the Skeleton
import TableSkeleton from "../contentLoader/TableSkeleton";
// Define the interface
export interface Course {
  id: number;
  course_code: string;
  description: string;
  instructor: string;
  instructor_id: string;
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
  showInstructor?: boolean;
}

// 2. Add the Custom Pagination Component (Same as StudentTable for consistency)
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
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      <span>
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

const AttendanceCourseTable: React.FC<Props> = ({
  courses,
  loading,
  onViewAttendance,
  showInstructor = true,
}) => {
  const columns: TableColumn<Course>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.course_code || "",
      wrap: true,
      center: true,
      width: "200px",
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description || "",
      wrap: true,
      style: {
        textAlign: "left",
      },
      grow: 2,
    },
    {
      name: "INSTRUCTOR",
      selector: (row) => row.instructor || "TBA",
      wrap: true,
      style: {
        textAlign: "left",
      },
      omit: !showInstructor,
    },
    {
      name: "STUDENTS",
      selector: (row) => row.students_count.toString(),
      center: true,
      width: "150px",
    },
    {
      name: "ATTENDANCE",
      selector: (row) => `${row.attendance_taken} sessions`,
      center: true,
      width: "120px",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1.5 text-xs rounded-full hover:bg-[#A9B5DF] transition-colors"
          onClick={() => onViewAttendance(row.id)}
          title="View Attendance"
        >
          <FaAngleRight className="w-3 h-3" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px",
      center: true,
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "700",
        padding: "12px 16px",
        backgroundColor: "blue",
        color: "white",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
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
    // Updated container styles to match StudentTable (bg-white, padding, shadow)
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
      {loading ? (
        // 3. Replaced simple text loading with TableSkeleton loop
        <>
          {[...Array(5)].map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          paginationComponent={CustomPagination} // 4. Applied Custom Pagination
          highlightOnHover
          striped
          responsive
          dense
          noDataComponent={
            <div className="py-8 text-center text-gray-500 bg-white">
              No courses found
            </div>
          }
        />
      )}
    </div>
  );
};

export default AttendanceCourseTable;