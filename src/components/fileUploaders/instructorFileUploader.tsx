import React from "react";
import * as XLSX from 'xlsx-js-style';

interface FileUploaderProps {
  file: File | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

const InstructorFileUploader: React.FC<FileUploaderProps> = ({
  file,
  isUploading,
  onFileChange,
  onUpload,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // --- Styles ---
    const centerBold = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    const center = {
      alignment: { horizontal: "center", vertical: "center" }
    };

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "E0E0E0" } },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // --- Data Structure ---
    const templateData = [
      // Row 1
      [{ v: "The Lewis College", s: centerBold }],
      // Row 2
      [{ v: "479 Magsaysay st., Cogon, Sorsogon City", s: center }],
      // Row 3
      [{ v: "INSTRUCTOR LIST", s: centerBold }], // Changed from STUDENT to INSTRUCTOR
      // Row 4 (Spacer)
      [],
      // Row 5
      [{ v: "HIGHER EDUCATION DEPARTMENT", s: center }],
      // Row 6 (Spacer)
      [],
      // Row 7: ACTUAL HEADERS
      [
        { v: "Instructor No.", s: headerStyle },
        { v: "Full Name", s: headerStyle },
        { v: "Gender", s: headerStyle },
        { v: "Department", s: headerStyle }
      ],
      // Row 8: Sample Data
      [
        { v: "INST-2023-01", s: center },
        { v: "Doe, John A.", s: { alignment: { horizontal: "left" } } },
        { v: "Male", s: center },
        { v: "College of Computer Studies", s: center }
      ]
    ];

    // --- Create Workbook ---
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // --- Formatting ---
    // Column widths
    ws['!cols'] = [
      { wch: 15 }, // Instructor No.
      { wch: 35 }, // Full Name
      { wch: 10 }, // Gender
      { wch: 20 }  // Department
    ];

    // Merge Cells (Rows 1, 2, 3, 5 span across 4 columns)
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Row 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Row 2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Row 3
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } }, // Row 5
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Instructor_Import_Template.xlsx");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {/* Upload Section */}
      <div className="flex flex-col space-y-3 basis-1/2 min-w-0">
        <h1 className="text-black text-lg font-semibold">Bulk Instructor Registration</h1>

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

      {/* Download Section */}
      <div className="flex flex-col items-center justify-center space-y-2 basis-1/2 min-w-0">
        <div className="text-sm text-blue-900 px-2 py-1 rounded-md text-center">
          <span className="font-medium text-blue-900">Warning!</span>{" "}
          Please use the official template to avoid format errors.
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="bg-white text-cyan-500 px-6 py-1 border border-cyan-500 rounded-md cursor-pointer hover:bg-cyan-600 hover:text-white transition text-sm w-full max-w-[500px]"
        >
          Download Excel Template
        </button>
      </div>
    </div>
  );
};

export default InstructorFileUploader;