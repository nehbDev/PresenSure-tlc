import React, { useEffect, useRef, useMemo } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// --- Types matching the Laravel Controller JSON Structure ---

interface SuccessItem {
  user_id: string;
  fullname: string;
  image_url: string;
  status: string;
}

interface SkippedItem {
  filename: string;
  reason: string;
}

interface FailedItem {
  user_id: string;
  fullname?: string | null;
  status?: string;
  error?: string;
}

export interface BulkUploadResponse {
  success: SuccessItem[];
  skipped: SkippedItem[];
  failed: {
    invalid_format: FailedItem[];
    user_not_found: FailedItem[];
    profile_exists: FailedItem[];
    upload_failed: FailedItem[];
  };
}

// --- Component Props ---

interface UploadResultsModalProps {
  show: boolean;
  onClose: () => void;
  results: BulkUploadResponse | null; // Changed to accept the full object
  pageType: "student" | "instructor";
}

// --- Component ---

const UploadResultsModal: React.FC<UploadResultsModalProps> = ({
  show,
  onClose,
  results,
  pageType,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus and allow ESC to close
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === modalRef.current) onClose();
  };

  // --- Flatten Data Logic ---
  // This transforms the complex backend object into a simple list for the table
  const flattenedRows = useMemo(() => {
    if (!results) return [];

    const rows: Array<{
      id: string;
      details: string;
      status: string;
      type: "success" | "skipped" | "failed";
    }> = [];

    // 1. Success
    (results.success || []).forEach((item) => {
      rows.push({
        id: item.user_id,
        details: item.fullname,
        status: "Uploaded",
        type: "success",
      });
    });

    // 3. Failed
    if (results.failed) {
      Object.values(results.failed).forEach((group) => {
        // Add check here too just in case a specific group is null
        (group || []).forEach((item) => {
          rows.push({
            id: item.user_id,
            details: item.fullname || item.error || "N/A",
            status: item.status || "Upload Error",
            type: "failed",
          });
        });
      });
    }

    return rows;
  }, [results]);

  if (!show) return null;

  const title =
    pageType === "student"
      ? "Student Upload Results"
      : "Instructor Upload Results";

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Processed {flattenedRows.length} items
            </p>
          </div>
          
          {/* Summary Stats Badges */}
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md flex items-center gap-1">
              <FaCheckCircle /> {results?.success.length || 0} Success
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md flex items-center gap-1">
              <FaTimesCircle /> {Object.values(results?.failed || {}).flat().length} Failed
            </span>
          </div>
        </div>

        {/* Content - Scrollable Table */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 border-b text-left w-1/4 font-semibold">ID</th>
                <th className="px-6 py-3 border-b text-left w-2/4 font-semibold">Fullname</th>
                <th className="px-6 py-3 border-b text-left w-1/4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flattenedRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* ID Column */}
                  <td className="px-6 py-3 truncate font-mono text-gray-700" title={row.id}>
                    {row.id}
                  </td>
                  
                  {/* Details Column */}
                  <td className="px-6 py-3 text-gray-600 truncate" title={row.details}>
                    {row.details}
                  </td>
                  
                  {/* Status Column */}
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          row.type === "success"
                            ? "bg-green-100 text-green-800"
                            : row.type === "skipped"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {flattenedRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-10">
                    No results available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md shadow-sm text-sm font-medium transition-all"
            autoFocus
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResultsModal;