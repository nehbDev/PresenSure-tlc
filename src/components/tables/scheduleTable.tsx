import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton";
import { useNavigate } from "react-router-dom"; 
import noProfile from "../../assets/noProfile.webp"; 

interface Subject {
  course_id: number;
  subject_code: string;
  description: string;
  instructor: string;
  instructor_image?: string; 
  units: number;
}

interface Props {
  subjects: Subject[];
  loading: boolean;
}

// 1. Added the CustomPagination component here
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

const ScheduleTable: React.FC<Props> = ({ subjects, loading }) => {
  console.log("Schedule Table Data (Current Render):", subjects);
  const navigate = useNavigate();
  
  const columns: TableColumn<Subject>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.subject_code || "",
      wrap: true,
      grow: 1, 
      minWidth: "140px", 
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description || "",
      wrap: true,
      grow: 3, 
      minWidth: "250px", 
    },
    {
      name: "INSTRUCTOR",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
            {/* Avatar Image */}
            <div className="flex-shrink-0">
                <img 
                    src={row.instructor_image || noProfile} 
                    alt="Instructor" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
            </div>
            {/* Name */}
            <span className="font-medium text-gray-700">
                {row.instructor || "TBA"}
            </span>
        </div>
      ),
      wrap: true,
      grow: 2, 
      minWidth: "200px",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1 text-xs rounded-full hover:bg-[#A9B5DF] transition-colors"
          onClick={() => {
            navigate(`/schedules/schedule-details?id=${row.course_id}`);
          }}
        >
          <FaAngleRight className="w-4 h-4" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "80px", 
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
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "8px 12px", 
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
    <div className="w-full">
      {loading ? (
        <>
          {[...Array(5)].map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          customStyles={customStyles}
          pagination
          paginationPerPage={10} // 2. Set default rows per page
          paginationComponent={CustomPagination} // 3. Connected the custom component
          highlightOnHover
          striped
          dense
          noDataComponent={<p className="py-4 text-center text-gray-500">No subjects found</p>}
        />
      )}
    </div>
  );
};

export default ScheduleTable;