import React from "react";
import * as XLSX from 'xlsx-js-style';

interface FileUploaderProps {
  file: File | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

const StudentFileUploader: React.FC<FileUploaderProps> = ({
  file,
  isUploading,
  onFileChange,
  onUpload,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // ... (Keep existing template generation logic exactly as is)
    const centerBold = { font: { bold: true, sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
    const center = { alignment: { horizontal: "center", vertical: "center" } };
    const headerStyle = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" }, fill: { fgColor: { rgb: "E0E0E0" } }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
    const dataCenter = { alignment: { horizontal: "center", vertical: "center" } };
    const dataLeft = { alignment: { horizontal: "left", vertical: "center" } };

    const templateData = [
      [{ v: "The Lewis College", s: center }],
      [{ v: "479 Magsaysay st., Cogon, Sorsogon City", s: centerBold }],
       [{ v: "STUDENT LIST", s: centerBold }],
      [],
      [{ v: "HIGHER EDUCATION DEPARTMENT", s: center }],
      [],
      [{ v: "Student No.", s: headerStyle }, { v: "Full Name", s: headerStyle }, { v: "Gender", s: headerStyle }, { v: "Program", s: headerStyle }, { v: "Year Level", s: headerStyle }, { v: "Block", s: headerStyle } ],
      [{ v: "C-2022-0111", s: dataCenter }, { v: "Santos, Miguel Antonio A.", s: dataLeft }, { v: "Male", s: dataCenter }, { v: "BSIT", s: dataCenter }, { v: "First Year", s: dataCenter }, { v: "A", s: dataCenter }],
      [{ v: "C-2022-0001", s: dataCenter }, { v: "Dela Cruz, Joshua Emmanuel D.", s: dataLeft }, { v: "Male", s: dataCenter }, { v: "BSIT", s: dataCenter }, { v: "Second Year", s: dataCenter }, { v: "A", s: dataCenter }],
      [{ v: "C-2022-0004", s: dataCenter }, { v: "Gutierrez, Camille Rose C.", s: dataLeft }, { v: "Female", s: dataCenter }, { v: "BSIT", s: dataCenter }, { v: "Third Year", s: dataCenter }, { v: "B", s: dataCenter }]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } }];

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Left side - Upload section */}
      <div className="flex flex-col space-y-3 basis-1/2 min-w-0">
        <h1 className="text-black text-lg font-semibold">Bulk Student Registration</h1>

        <div className="flex items-center border-2 border-gray-300 rounded-md overflow-hidden bg-gray-50">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="cursor-pointer bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 text-sm whitespace-nowrap"
          >
            Browse...
          </button>

          <span className="text-sm text-gray-700 px-3 py-2 flex-1 min-w-0 truncate">
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
          className="bg-blue-600 text-white px-3 py-2 rounded-md w-full sm:w-[150px] hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
        >
          {isUploading ? "Extracting..." : "Extract"}
        </button>
      </div>

      {/* Right side - Template notice */}
      <div className="flex flex-col items-center justify-center space-y-2 basis-1/2 min-w-0 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="text-sm text-blue-900 px-2 py-1 rounded-md text-center">
          <span className="font-medium text-blue-900">Warning!</span>{" "}
          Please use the official template. The system skips the first 7 header rows and reads data starting from Row 9.
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="bg-white text-cyan-500 px-6 py-2 border border-cyan-500 rounded-md cursor-pointer hover:bg-cyan-600 hover:text-white transition text-sm w-full max-w-[500px]"
        >
          Download Excel Template
        </button>
      </div>
    </div>
  );
};

export default StudentFileUploader;