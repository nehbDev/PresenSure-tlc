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

const InstructorTable: React.FC<Props> = ({ instructors, loading }) => {
  const navigate = useNavigate();

  const columns: TableColumn<Instructor>[] = [
    {
      name: "PROFILE",
      cell: (row) => (
        <div className="py-2">
            {row.profile?.image_link ? (
              <img
                src={row.profile.image_link}
                alt={`${row.firstname} ${row.lastname}`}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <img
                src={noProfile}
                alt="No Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            )}
        </div>
      ),
      center: true,
      width: "100px", // Slightly wider for breathing room
    },
    {
      name: "INSTRUCTOR ID",
      selector: (row) => row.id || "N/A",
      sortable: true,
      width: "140px", // Fixed width for IDs keeps them neat
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.middle_initial ? ` ${row.middle_initial}` : ""
        }`,
      sortable: true,
      grow: 2, // Takes up 2x space compared to other columns
      wrap: true, // Ensures long names don't break layout
    },
    {
      name: "DEPARTMENT",
      selector: (row) => row.department || "N/A",
      sortable: true,
      grow: 1, // Takes up remaining space
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
        backgroundColor: "blue", // Matches your button color for consistency
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
        color: "white", // Ensure text remains white
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#334155", // Slate-700 for better readability
        minHeight: "60px", // More vertical breathing room
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
    pagination: {
        style: {
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
        }
    }
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
        highlightOnHover
        striped
        responsive
        // Removed 'dense' to give the table a more modern, spacious feel
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