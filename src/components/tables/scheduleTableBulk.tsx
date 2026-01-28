// ScheduleTable-ImportSchedule.tsx
import React from "react";
import DataTable from "react-data-table-component";

interface Schedule {
    subject_code: string;
    description: string;
    days: string;
    start_time: string;
    end_time: string;
    schedule_type: string;
    room: string;
    instructor_name?: string; // <-- add full name
    instructor_id?: string;
}

interface ScheduleTableProps {
    data: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const columns = [
        { name: "SUBJECT CODE", selector: (row: Schedule) => row.subject_code, center: true },
        { name: "DESCRIPTION", selector: (row: Schedule) => row.description, center: true },
        { 
            name: "INSTRUCTOR", 
            selector: (row: Schedule) => row.instructor_name || row.instructor_id || "N/A", 
            center: true 
        },
        { name: "DAYS", selector: (row: Schedule) => row.days, center: true },
        { name: "TIME", selector: (row: Schedule) => `${row.start_time} - ${row.end_time}`, center: true },
        { name: "TYPE", selector: (row: Schedule) => row.schedule_type, center: true },
        { name: "ROOM", selector: (row: Schedule) => row.room, center: true },
    ];

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                responsive
                striped
                dense
                persistTableHead
                keyField="subject_code"
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                customStyles={{
                    headCells: { 
                        style: { 
                            fontSize: "14px", 
                            fontWeight: "bold", 
                            padding: "8px 12px", 
                            backgroundColor: "#1d4ed8", 
                            color: "white", 
                            borderRight: "1px solid #e5e7eb" 
                        } 
                    },
                    cells: { 
                        style: { 
                            fontSize: "14px", 
                            padding: "8px 12px", 
                            borderRight: "1px solid #e5e7eb", 
                            textAlign: "center" 
                        } 
                    },
                    table: { 
                        style: { width: "100%", tableLayout: "auto", borderCollapse: "separate" } 
                    },
                    headRow: { 
                        style: { width: "100%", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", overflow: "hidden" } 
                    },
                    rows: { style: { width: "100%" } },
                }}
            />
        </div>
    );
};

export default ScheduleTable;
