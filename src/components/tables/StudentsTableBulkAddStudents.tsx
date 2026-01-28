import React from "react";
import DataTable from "react-data-table-component";

interface StudentsTableProps {
    data: Array<{
        id: string;
        firstname: string;
        middle_initial: string;
        lastname: string;
        suffix?: string;
        sex: string;
        course?: string;
        year_level?: string;
        section?: string;
        [key: string]: any;
    }>;
    onRemoveRow?: (id: string, index: number) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ data, onRemoveRow }) => {
    if (!data || data.length === 0) return null;

    const columns = [
        {
            name: "#",
            cell: (_: any, index: number) => index + 1,
            width: "60px",
            center: true,
        },
        {
            name: "ID",
            selector: (row: any) => row.id || "N/A",
            sortable: false,
            center: true,
        },
        {
            name: "FULLNAME",
            selector: (row: any) => {
                const firstname = row.firstname || "N/A";
                const middleInitial = row.middle_initial || "";
                const lastname = row.lastname || "N/A";
                const suffix = row.suffix ? ` ${row.suffix}` : "";
                return `${lastname}, ${firstname}${suffix}${middleInitial ? ` ${middleInitial}` : ""}`;
            },
            sortable: false,
            center: true,
        },
        {
            name: "SEX",
            selector: (row: any) => row.sex || "N/A",
            sortable: false,
            center: true,
        },
        {
            name: "COURSE",
            selector: (row: any) => row.course || "N/A",
            sortable: false,
            center: true,
        },
        {
            name: "YEAR LEVEL",
            selector: (row: any) => row.year_level || "N/A",
            sortable: false,
            center: true,
        },
        {
            name: "SECTION",
            selector: (row: any) => row.section || "N/A",
            sortable: false,
            center: true,
        },
        ...(onRemoveRow
            ? [
                  {
                      name: "ACTION",
                      cell: (row: any, index: number) => (
                          <button
                              onClick={() => onRemoveRow(row.id, index)}
                              className="text-red-500 hover:underline"
                          >
                              Remove
                          </button>
                      ),
                      center: true,
                  },
              ]
            : []),
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
                keyField="id"
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50]}
                customStyles={{
                    headCells: {
                        style: {
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "8px 12px",
                            backgroundColor: "blue",
                            borderRight: "1px solid #e5e7eb",
                            color: "white",
                        },
                    },
                    cells: {
                        style: {
                            fontSize: "14px",
                            padding: "8px 12px",
                            borderRight: "1px solid #e5e7eb",
                            textAlign: "center",
                        },
                    },
                    table: {
                        style: {
                            width: "100%",
                            tableLayout: "auto",
                            borderCollapse: "separate",
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
                    rows: {
                        style: {
                            width: "100%",
                        },
                    },
                }}
            />
        </div>
    );
};

export default StudentsTable;