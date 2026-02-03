import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton"; // Create if needed
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface Instructor {
  id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  department?: string;
  profile?: { image_link: string } | null; // Add | null here
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
      cell: (row) =>
        row.profile?.image_link ? (
          <img
            src={row.profile.image_link}
            alt={`${row.firstname} ${row.lastname}`}
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
      width: "81px",
    },
    {
      name: "INSTRUCTOR ID",
      selector: (row) => row.id || "N/A",
      center: true,
    },
    {
      name: "FULL NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname}${
          row.middle_initial ? ` ${row.middle_initial}` : ""
        }`,
      style: {
        textAlign: "left",
      },
    },
    {
      name: "DEPARTMENT",
      selector: (row) => row.department || "N/A",
      style: {
        textAlign: "left",
      },
    },

    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1.5 rounded-full hover:bg-[#4a5294] transition-colors shadow-sm"
          onClick={() => {
            // Updated Navigation Logic
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
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        overflow: "hidden",
      },
    },
    rows: {
      style: {
        minHeight: "56px",
        "&:hover": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
        {[...Array(5)].map((_, i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-md shadow-sm border border-gray-200">
        <p className="text-gray-500 text-lg">No instructors found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200">
      <Toaster position="top-center" />
      <DataTable
        columns={columns}
        data={instructors}
        customStyles={customStyles}
        pagination
        highlightOnHover
        striped
        dense
        noDataComponent={
          <div className="text-center p-8">
            <p className="text-gray-500 text-lg">No instructors found.</p>
          </div>
        }
      />
    </div>
  );
};

export default InstructorTable;
