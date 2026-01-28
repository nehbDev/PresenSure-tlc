import React from "react";
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "success" | "warning";
}

const RestoreInstructorModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "success", // Default to success for Restore actions
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: {
      icon: <FaExclamationTriangle className="w-6 h-6 text-red-600" />,
      iconBg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    success: {
      icon: <FaCheckCircle className="w-6 h-6 text-green-600" />,
      iconBg: "bg-green-100",
      button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
    warning: {
      icon: <FaInfoCircle className="w-6 h-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 bg-opacity-50 backdrop-blur-sm transition-opacity p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all scale-100">
        <div className="p-6">
          <div className={`flex items-center justify-center w-12 h-12 mx-auto ${currentStyle.iconBg} rounded-full mb-4`}>
            {currentStyle.icon}
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
              className={`px-5 py-2.5 text-white rounded-md shadow-sm font-medium transition-colors flex items-center justify-center min-w-[100px] focus:outline-none focus:ring-2 ${currentStyle.button}`}
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
    </div>
  );
};

export default RestoreInstructorModal;