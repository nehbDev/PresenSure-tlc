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
    const templateData = [
      ["ID", "FIRSTNAME", "MIDDLE INITIAL", "LASTNAME", "SEX", "DEPARTMENT", "SPECIALIZATION"],
      ["C-INS-0001", "Juan", "A.", "Dela Cruz", "MALE", "Computer Science", "AI"],
      ["C-INS-0002", "Maria", "Q.", "Santos", "FEMALE", "Mathematics", "Statistics"],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "instructors_template.xlsx");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {/* Left side - Upload section */}
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

      {/* Right side - Template notice */}
      <div className="flex flex-col items-center justify-center space-y-2 basis-1/2 min-w-0">
        <div className="text-sm text-blue-900 px-2 py-1 rounded-md text-center">
          <span className="font-medium text-blue-900">Warning!</span>{" "}
          Please view the Excel template to avoid mistakes when uploading instructor information.
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="bg-white text-cyan-500 px-6 py-1 border border-cyan-500 rounded-md cursor-pointer hover:bg-cyan-600 hover:text-white transition text-sm w-full max-w-[500px]"
        >
          Excel Template
        </button>
      </div>
    </div>
  );
};

export default FileUploader;