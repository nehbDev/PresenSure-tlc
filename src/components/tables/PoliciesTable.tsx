// src/components/PoliciesDataTable.tsx

import React from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";

export interface Subject {
  id: number;
  subject_code: string;
  description: string;
}

export interface Policy {
  id: number;
  policy_name: string;
  late_threshold_minutes: number;
  absent_threshold_minutes: number;
  lates_to_absent?: number;
  consecutive_absents_to_fail?: number;
  attendance_weight?: number;
  is_global: boolean;
  subjects?: Subject[];
}

interface PoliciesDataTableProps {
  policies: Policy[];
  loading: boolean;
  onDelete: (id: number) => void;
}

const PoliciesDataTable: React.FC<PoliciesDataTableProps> = ({ policies, loading, onDelete }) => {
  const navigate = useNavigate();

  const columns: TableColumn<Policy>[] = [
    {
      name: "POLICY NAME",
      selector: (row) => row.policy_name,
      sortable: true,
    },
    {
      name: "LATE THRESHOLD",
      selector: (row) => `${row.late_threshold_minutes} minutes`,
      sortable: true,
    },
    {
      name: "ABSENT THRESHOLD",
      selector: (row) => `${row.absent_threshold_minutes} minutes`,
      sortable: true,
    },
    {
      name: "LATES TO ABSENT",
      selector: (row) => row.lates_to_absent ?? "N/A",
      sortable: true,
    },
    {
      name: "CONSECUTIVE ABSENTS TO FAIL",
      selector: (row) => row.consecutive_absents_to_fail ?? "N/A",
      sortable: true,
    },
    {
      name: "ATTENDANCE WEIGHT",
      selector: (row) => (row.attendance_weight ? `${row.attendance_weight}%` : "N/A"),
      sortable: true,
    },
    {
      name: "SCOPE",
      selector: (row) => (row.is_global ? "Global" : "Specific Subjects"),
      sortable: true,
    },
    {
      name: "SUBJECTS",
      cell: (row) => (
        <div>
          {row.is_global ? (
            <span className="text-blue-600">All Subjects</span>
          ) : (
            <ul className="text-sm">
              {row.subjects &&
                row.subjects.map((subject) => (
                  <li key={subject.id}>
                    {subject.subject_code} - {subject.description}
                  </li>
                ))}
            </ul>
          )}
        </div>
      ),
      wrap: true,
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/attendance-policies/edit/${row.id}`)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        padding: "8px 12px",
        backgroundColor: "#2D336B",
        color: "white",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "8px 12px",
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {loading ? (
        <p className="text-sm text-gray-600">Loading policies...</p>
      ) : (
        <DataTable
          columns={columns}
          data={policies}
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped
          dense
        />
      )}
    </div>
  );
};

export default PoliciesDataTable;
