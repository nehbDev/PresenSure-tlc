import React from "react";
import { createPortal } from "react-dom";
import { FaArchive } from "react-icons/fa";

interface ArchiveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subjectCode?: string; // Optional: to show which course is being archived
  isLoading?: boolean;
}

const ArchiveCourseModal: React.FC<ArchiveCourseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subjectCode,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all scale-100 animate-fadeIn">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <FaArchive className="w-6 h-6 text-red-600" />
          </div>

          {/* Text Content */}
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            Archive Course
          </h3>
          <div className="text-sm text-center text-gray-500 mb-6 space-y-2">
            <p>Are you sure you want to archive <strong>{subjectCode || "this course"}</strong>?</p>
            <p className="text-xs text-gray-400">
              This will hide the course and its schedules from the active list. 
              (You can restore it later from the archives).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm font-medium transition-colors flex items-center justify-center min-w-[120px] focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Yes, Archive"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ArchiveCourseModal;