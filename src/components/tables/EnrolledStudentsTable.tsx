import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type TableColumn,
  type TableStyles,
} from "react-data-table-component";
import { FaAngleRight } from "react-icons/fa";
import noProfile from "../../assets/noProfile.webp";
import TableSkeleton from "../contentLoader/TableSkeleton";

export interface EnrolledStudent {
  user_id: string;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  suffix?: string;
  sex: string;

  // 1. Flat Data
  program?: string;
  year_level?: string;
  block?: string;

  // 2. Nested Singular Data
  student?: {
    program?: string;
    year?: string;
    year_level?: string;
    block?: string;
  };

  // 3. Nested Array Data
  students?: {
    program?: string;
    year?: string;
    block?: string;
    semester_id?: number;
  }[];

  profile?: {
    image_link: string;
  };

  [key: string]: any;
}

interface Props {
  students: EnrolledStudent[];
  loading?: boolean;
}

const EnrolledStudentsTable: React.FC<Props> = ({
  students,
  loading = false,
}) => {
  const navigate = useNavigate();

  const getData = (
    row: EnrolledStudent,
    field: "program" | "year" | "block",
  ) => {
    if (row[field]) return row[field];
    if (field === "year" && row.year_level) return row.year_level;

    if (row.student) {
      if (row.student[field]) return row.student[field];
      if (field === "year" && row.student.year_level)
        return row.student.year_level;
    }

    if (row.students && row.students.length > 0) {
      const latest = row.students[row.students.length - 1];
      if (latest[field]) return latest[field];
    }

    return "N/A";
  };

  const maleStudents = students.filter((s) => s.sex?.toLowerCase() === "male");
  const femaleStudents = students.filter(
    (s) => s.sex?.toLowerCase() === "female",
  );

  const columns: TableColumn<EnrolledStudent>[] = [
    {
      name: "PROFILE",
      cell: (row) => (
        <div className="py-2">
          <img
            src={row.profile?.image_link || noProfile}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        </div>
      ),
      center: true,
      width: "80px",
    },
    {
      name: "STUDENT ID",
      selector: (row) => row.user_id,
      grow: 1,
    },
    {
      name: "NAME",
      selector: (row) =>
        `${row.lastname}, ${row.firstname} ${row.middle_initial || ""} ${
          row.suffix || ""
        }`,
      wrap: true,
      grow: 3,
    },
    {
      name: "PROGRAM",
      selector: (row) => getData(row, "program"),
      grow: 1,
      center: true,
    },
    {
      name: "YEAR LEVEL",
      selector: (row) => getData(row, "year"),
      grow: 1,
      center: true,
    },
    {
      name: "BLOCK",
      selector: (row) => getData(row, "block"),
      grow: 1,
      center: true,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="flex items-center justify-center bg-[#2D336B] text-white p-1.5 text-xs rounded-full hover:bg-[#A9B5DF] transition-colors shadow-sm"
          onClick={() =>
            // ADDED: { state: { source: "course_details" } }
            navigate(`/students/student-details?id=${row.user_id}`, {
              state: { source: "course_details" },
            })
          }
          title="View Student Details"
        >
          <FaAngleRight className="w-4 h-4" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
      width: "80px",
    },
  ];

  const getCustomStyles = (color: string): TableStyles => ({
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        padding: "12px",
        backgroundColor: color,
        color: "white",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "12px",
      },
    },
    headRow: {
      style: {
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        overflow: "hidden",
      },
    },
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {[...Array(5)].map((_, i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- MALE TABLE --- */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-blue-800 ml-1">Male</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={maleStudents}
            customStyles={getCustomStyles("#2563eb")}
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="p-6 text-center text-gray-400 italic">
                No male students enrolled.
              </div>
            }
          />
        </div>
      </div>

      {/* --- FEMALE TABLE --- */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-pink-800 ml-1">Female</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={femaleStudents}
            customStyles={getCustomStyles("#db2777")}
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="p-6 text-center text-gray-400 italic">
                No female students enrolled.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default EnrolledStudentsTable;
