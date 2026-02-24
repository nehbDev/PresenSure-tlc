import React from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

const ArchiveStudent: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  const iconColor = variant === "danger" ? "text-red-600" : "text-yellow-600";
  const iconBg = variant === "danger" ? "bg-red-100" : "bg-yellow-100";
  const buttonBg =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/20 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all scale-100 animate-fadeIn">
        <div className="p-6">
          <div
            className={`flex items-center justify-center w-12 h-12 mx-auto ${iconBg} rounded-full mb-4`}
          >
            <FaExclamationTriangle className={`w-6 h-6 ${iconColor}`} />
          </div>

          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            {title}
          </h3>
          <div className="text-sm text-center text-gray-500 mb-6">
            {message}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 text-white rounded-md shadow-sm font-medium transition-colors flex items-center justify-center min-w-[100px] focus:outline-none focus:ring-2 ${buttonBg}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ArchiveStudent;