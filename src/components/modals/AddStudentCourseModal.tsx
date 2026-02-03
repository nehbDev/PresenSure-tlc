import React, { useState } from "react";
import toast from "react-hot-toast";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentId: string) => Promise<void>;
  isLoading: boolean;
}

const AddStudentCourseModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [studentId, setStudentId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Regex Validation for C-YYYY-NNNN format
    const idPattern = /^C-\d{4}-\d{4}$/;

    if (!studentId) {
      toast.error("Student ID is required");
      return;
    }

    if (!idPattern.test(studentId)) {
      toast.error("Invalid format. Use C-YYYY-NNNN (e.g., C-2023-1234)");
      return;
    }

    await onSubmit(studentId);
    setStudentId(""); // Clear input on success
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Add Single Student</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl px-2 transition-colors"
            disabled={isLoading}
            aria-label="Close"
          >
            &#10005; {/* HTML Entity for X */}
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="studentId"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              placeholder="C-202X-XXXX"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono uppercase text-gray-800"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
              Format required: <span className="font-mono font-medium">C-YYYY-NNNN</span>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentCourseModal;