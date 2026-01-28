import React, { useState, useMemo, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn, TableStyles } from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import dayjs from "dayjs";
import TableSkeleton from "../contentLoader/TableSkeleton"; // 1. Import Skeleton

// --- Interfaces ---

export interface PeriodSessionInfo {
  id: number;
  date: string;
  type: string;
}

export interface PeriodMetadata {
  period_id: number;
  total_classes: number;
  sessions: PeriodSessionInfo[];
}

export interface StudentPeriodData {
  present: number;
  late: number;
  absent: number;
  attendance_percentage: number;
  attendance_grade: number; 
  period_status: string;
  logs: Record<number, string>;
}

export interface StudentReport {
  student_id: string;
  name: string;
  sex: string;
  periods: Record<string, StudentPeriodData>;
}

export interface PeriodsApiResponse {
  course: string;
  description: string;
  periods_metadata: Record<string, PeriodMetadata>;
  students: StudentReport[];
  policy_summary?: {
      consecutive_limit: number;
      passing_threshold: number;
  };
}

interface Props {
  data: PeriodsApiResponse | null;
  loading: boolean;
}

// --- Helper Functions ---
const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "unknown";
  let classes = "bg-gray-100 text-gray-400 border border-gray-200";
  let label = "-";

  switch (s) {
    case "present":
      classes = "bg-green-50 text-green-600 border border-green-200";
      label = "P";
      break;
    case "late":
      classes = "bg-yellow-50 text-yellow-600 border border-yellow-200";
      label = "L";
      break;
    case "absent":
      classes = "bg-red-50 text-red-600 border border-red-200";
      label = "A";
      break;
    case "excused":
      classes = "bg-blue-50 text-blue-600 border border-blue-200";
      label = "E";
      break;
    case "n/a":
    case "no sessions":
      classes = "bg-gray-50 text-gray-300";
      label = "-";
      break;
  }

  return (
    <div className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold shadow-sm ${classes}`} title={s}>
      {label}
    </div>
  );
};

// --- Dropdown Filter ---
const DropdownFilter: React.FC<{
  label: string;
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
}> = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex justify-between items-center w-full min-h-[42px] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <span className="truncate">{selected || `Select ${label}`}</span>
        <svg className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="origin-top-right absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button onClick={() => { setSelected(""); setOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selected === "" ? "bg-gray-100 font-semibold" : ""}`}>All</button>
            {options.map((option) => (
              <button key={option} onClick={() => { setSelected(option); setOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selected === option ? "bg-gray-100 font-semibold" : ""}`}>{option}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AttendancePeriodsTable: React.FC<Props> = ({ data, loading }) => {
  const [filterText, setFilterText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.students.filter(
      (student) =>
        student.name.toLowerCase().includes(filterText.toLowerCase()) ||
        student.student_id.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [data, filterText]);

  const periodOptions = useMemo(() => {
      return data ? Object.keys(data.periods_metadata) : [];
  }, [data]);

  const columns = useMemo(() => {
    if (!data) return [];

    const baseColumns: TableColumn<StudentReport>[] = [
      {
        name: "ID",
        selector: (row) => row.student_id,
        sortable: true,
        width: "120px", 
        style: {
             position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white', borderRight: '1px solid #e5e7eb'
        }
      },
      {
        name: "STUDENT NAME",
        selector: (row) => row.name,
        sortFunction: (a, b) => {
            if (a.sex !== b.sex) return b.sex.localeCompare(a.sex);
            return a.name.localeCompare(b.name);
        },
        sortable: true,
        width: "220px",
        style: { 
             fontWeight: "bold", color: "#374151", borderRight: "1px solid #e5e7eb",
             position: 'sticky', left: '120px', zIndex: 1, backgroundColor: 'white'
        },
        cell: (row) => (
            <div className="flex flex-col py-1">
                <span>{row.name}</span>
            </div>
        )
      },
    ];

    const dynamicCols: TableColumn<StudentReport>[] = [];
    const periodKeys = Object.keys(data.periods_metadata);

    periodKeys.forEach((periodName) => {
      if (selectedPeriod && selectedPeriod !== periodName) return;

      const meta = data.periods_metadata[periodName];
      if (!meta.sessions) return;

      meta.sessions.forEach((session) => {
        dynamicCols.push({
          name: (
            <div className="flex flex-col items-center py-1">
              <span className="text-[10px] font-bold">{dayjs(session.date).format("MMM D")}</span>
              <span className="text-[9px] opacity-75 uppercase">{(session.type || "GEN").substring(0, 3)}</span>
            </div>
          ),
          selector: (row) => row.periods[periodName]?.logs?.[session.id] || "",
          cell: (row) => getStatusBadge(row.periods[periodName]?.logs?.[session.id]),
          center: true,
          width: "55px",
          style: { padding: '0 2px' }, 
        });
      });

      dynamicCols.push({
        name: `${periodName}`,
        selector: (row) => row.periods[periodName]?.attendance_grade || 0,
        sortable: true,
        cell: (row) => {
            const grade = row.periods[periodName]?.attendance_grade;
            const meta = data.periods_metadata[periodName];
            
            if (meta.total_classes === 0) {
                 return <span className="text-gray-300 text-xs">-</span>;
            }

            return (
                <span className="font-bold text-gray-800 text-xs bg-white px-2 py-1 rounded border border-gray-300">
                    {Number(grade ?? 0).toFixed(2)}
                </span>
            );
        },
        center: true,
        width: "100px",
        style: { borderLeft: "1px solid #e5e7eb", backgroundColor: "#f9fafb" },
      });

      dynamicCols.push({
        name: "Status",
        selector: (row) => row.periods[periodName]?.period_status || "-",
        center: true,
        grow: 1,
        minWidth: "100px",
        style: { backgroundColor: "#f9fafb", borderRight: "1px solid #e5e7eb" },
        cell: (row) => {
            const status = row.periods[periodName]?.period_status;
            if (!status || status === '') {
                 return <span className="text-gray-300 font-bold">-</span>;
            }

            const isFailed = status?.includes("Failed") || status === 'Failed';
            
            if (isFailed) {
                return (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
                        {status}
                    </span>
                );
            }
            
            return <span>{status}</span>;
        }
      });
    });

    return [...baseColumns, ...dynamicCols];
  }, [data, selectedPeriod]);

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "12px", fontWeight: "800", padding: "10px 4px",
        backgroundColor: "#2D336B", color: "white", justifyContent: "center",
      },
    },
    cells: {
      style: { fontSize: "12px", padding: "6px", borderRight: "1px dashed #f3f4f6" },
    },
    headRow: {
      style: { borderTopLeftRadius: "8px", borderTopRightRadius: "8px", overflow: "hidden" },
    },
    rows: {
        style: { minHeight: '50px' }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
        <div className="min-h-[42px] w-48 flex-shrink-0">
          <DropdownFilter label="Period" options={periodOptions} selected={selectedPeriod} setSelected={setSelectedPeriod} />
        </div>
        <div className="flex-1 min-h-[42px]">
          <div className="relative flex items-center h-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search student..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
        {loading ? (
           // 2. Replaced Spinner with TableSkeleton Loop
          <div className="p-4">
            {[...Array(8)].map((_, i) => (
               <TableSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            customStyles={customStyles}
            pagination
            paginationPerPage={15}
            highlightOnHover
            striped
            responsive
            dense
            fixedHeader
            fixedHeaderScrollHeight="600px"
            noDataComponent={<div className="py-8 text-center text-gray-500 bg-white">No data found.</div>}
          />
        )}
      </div>
    </div>
  );
};

export default AttendancePeriodsTable;