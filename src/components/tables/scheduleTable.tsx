import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import TableSkeleton from "../contentLoader/TableSkeleton";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import noProfile from "../../assets/noProfile.webp"; 

interface Subject {
  course_id: number;
  subject_code: string;
  description: string;
  instructor: string;
  // 1. Add the new image field to the interface
  instructor_image?: string; 
  units: number;
}

interface Props {
  subjects: Subject[];
  loading: boolean;
}

const ScheduleTable: React.FC<Props> = ({ subjects, loading }) => {
  console.log("Schedule Table Data (Current Render):", subjects);
  const navigate = useNavigate();
  const columns: TableColumn<Subject>[] = [
    {
      name: "SUBJECT CODE",
      selector: (row) => row.subject_code || "",
      wrap: true,
      style: { textAlign: "left" },
      width: "20%",
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description || "",
      wrap: true,
      style: { textAlign: "left" },
      width: "35%",
    },
    {
      name: "INSTRUCTOR",
      // 2. Use 'cell' to render custom HTML (Image + Name)
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
      style: { textAlign: "left" },
      width: "35%",
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
      width: "10%",
      style: { textAlign: "center" },
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
        padding: "8px 12px", // Adjusted padding for better vertical alignment
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
          highlightOnHover
          striped
          dense
          noDataComponent={<p className="py-4">No subjects found</p>}
        />
      )}
    </div>
  );
};

export default ScheduleTable;