import React from "react";
import * as XLSX from 'xlsx-js-style';
interface FileUploaderProps {
    file: File | null;
    isUploading: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    file,
    isUploading,
    onFileChange,
    onUpload,
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        // 1. Define Styles (Center, Bold, Borders)
        const centerStyle = { 
            alignment: { horizontal: "center", vertical: "center" } 
        };
        
        const titleStyle = { 
            font: { bold: true, sz: 14 }, 
            alignment: { horizontal: "center", vertical: "center" } 
        };

        const subTitleStyle = {
             font: { bold: true }, 
             alignment: { horizontal: "center", vertical: "center" } 
        };

        const headerRowStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } }, // Blue background for columns
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const cellStyle = {
             border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };

        // 2. Define the Top Header content
        // We match the columns from your CSV: Subject_Code through Instructor (7 columns total, index 0-6)
        const topHeaders = [
            [{ v: "The Lewis College", s: titleStyle }],
            [{ v: "479 Magsaysay st., Cogon, Sorsogon City", s: centerStyle }],
            [{ v: "SCHEDULE LIST IMPORT TEMPLATE", s: subTitleStyle }], // Adapted title for context
            [], // Empty Row for spacing
            [{ v: "HIGHER EDUCATION DEPARTMENT", s: subTitleStyle }],
            [], // Empty Row for spacing
        ];

        // 3. Define Column Headers (Based on your CSV file)
        const columns = [
            "Subject_Code", 
            "Description", 
            "Days", 
            "Time", 
            "Type", 
            "Room", 
            "Instructor"
        ];

        // Apply style to column headers
        const columnRow = columns.map(col => ({ v: col, s: headerRowStyle }));

        // 4. Define Sample Data (Based on your CSV file)
        const sampleData = [
            { v: "CoC 5101-A", s: cellStyle },
            { v: "INTRODUCTION TO COMPUTING", s: cellStyle },
            { v: "MWF", s: cellStyle },
            { v: "08:00 AM - 09:00 AM", s: cellStyle },
            { v: "Lecture", s: cellStyle },
            { v: "ComLab - A", s: cellStyle },
            { v: "2000-0022", s: cellStyle },
        ];

        // 5. Combine all rows
        const wsData = [
            ...topHeaders,
            columnRow,
            sampleData
        ];

        // 6. Create Workbook and Worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // 7. Add Merges 
        // We merge columns A to G (Index 0 to 6) for the top headers so they center properly
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Row 1: The Lewis College
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Row 2: Address
            { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Row 3: Title
            { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } }, // Row 5: Department
        ];

        // 8. Set Column Widths for better visibility
        ws['!cols'] = [
            { wch: 15 }, // Subject_Code
            { wch: 40 }, // Description
            { wch: 10 }, // Days
            { wch: 20 }, // Time
            { wch: 15 }, // Type
            { wch: 15 }, // Room
            { wch: 15 }, // Instructor
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "schedule_template.xlsx");
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-4">
            {/* Left side - Upload section */}
            <div className="flex flex-col space-y-3 basis-1/2 min-w-0">
                <h1 className="text-black text-lg font-semibold">Bulk Schedule Import</h1>

                <div className="flex items-center border-2 border-gray-300 rounded-md overflow-hidden">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                        className="cursor-pointer bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-1 text-sm"
                    >
                        Browse...
                    </button>

                    <span className="text-sm text-gray-700 px-3 py-1 flex-1 min-w-0 truncate">
                        {file?.name || "No file selected."}
                    </span>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={(e) => {
                            onFileChange(e);
                            e.currentTarget.value = "";
                        }}
                        className="hidden"
                    />
                </div>

                <button
                    onClick={onUpload}
                    disabled={isUploading || !file}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md w-[150px] hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                >
                    {isUploading ? "Extracting..." : "Extract"}
                </button>
            </div>

            {/* Right side - Template notice */}
            <div className="flex flex-col items-center justify-center space-y-2 basis-1/2 min-w-0">
                <div className="text-sm text-blue-900 px-2 py-1 rounded-md text-center">
                    <span className="font-medium text-blue-900">Warning!</span>{" "}
                    Please view the Excel template to avoid mistakes when uploading schedules.
                </div>

                <button
                    onClick={handleDownloadTemplate}
                    className="bg-white text-cyan-500 px-6 py-1 border border-cyan-500 rounded-md cursor-pointer hover:bg-cyan-600 hover:text-white transition text-sm w-[500px]"
                >
                    Excel Template
                </button>
            </div>
        </div>
    );
};

export default FileUploader;
