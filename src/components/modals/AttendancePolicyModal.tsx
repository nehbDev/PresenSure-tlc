// src/components/modals/AttendancePolicyModal.tsx
import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import apiService from "../../services/ApiService";
import { toast } from "react-hot-toast";

interface PolicyFormData {
  late_threshold_minutes: number;
  absent_threshold_minutes: number;
  lates_to_absent?: number;
  consecutive_absents_to_fail?: number;
  attendance_weight?: number;
}

interface AttendancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AttendancePolicyModal: React.FC<AttendancePolicyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PolicyFormData>({
    late_threshold_minutes: 15,
    absent_threshold_minutes: 30,
    lates_to_absent: 3,
    consecutive_absents_to_fail: 5,
    attendance_weight: 10,
  });
  const [loading, setLoading] = useState(false);
  const [hasExistingPolicy, setHasExistingPolicy] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Add this state
  const [fetchLoading, setFetchLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Add this function before the useEffect
  const fetchPolicy = async () => {
    try {
      setFetchLoading(true);
      const response = await apiService.get<{ data: PolicyFormData }>(
        "/attendance-policy/my",
        config
      );
      if (response.data.data) {
        setFormData(response.data.data);
        setHasExistingPolicy(true);
        setIsEditMode(false);
      } else {
        setHasExistingPolicy(false);
        setIsEditMode(true);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasExistingPolicy(false);
        setIsEditMode(true);
      } else {
        toast.error("Failed to load policy");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch policy details if exists
  useEffect(() => {
    if (isOpen) fetchPolicy();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.post("/attendance-policy/my", formData, config);
      toast.success(
        hasExistingPolicy
          ? "Policy updated successfully"
          : "Policy created successfully"
      );
      setHasExistingPolicy(true);
      setIsEditMode(false); // Switch back to view mode after saving
      onSave();
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save policy";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true); // Switch to edit mode
  };

  const handleCancelEdit = () => {
    if (hasExistingPolicy) {
      if (isEditMode) {
        setIsEditMode(false);
        fetchPolicy();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-600">Loading policy...</p>
          </div>
        </div>
      </div>
    );
  }

  const showForm = !hasExistingPolicy || isEditMode;
  const isUpdating = hasExistingPolicy && isEditMode;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {showForm
            ? isUpdating
              ? "Edit Attendance Policy"
              : "Create Attendance Policy"
            : "Attendance Policy"}
        </h2>

        {!showForm ? (
          // Display existing policy data (View Mode)
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Late Threshold
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.late_threshold_minutes} minutes
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Absent Threshold
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.absent_threshold_minutes} minutes
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Lates to Equal One Absent
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.lates_to_absent || "Not set"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Consecutive Absents to Fail
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.consecutive_absents_to_fail || "Not set"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Attendance Weight
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.attendance_weight}% of final grade
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Policy
              </button>
            </div>
          </div>
        ) : (
          // Display add/edit form (Create/Edit Mode)
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            {/* Late Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                name="late_threshold_minutes"
                value={formData.late_threshold_minutes}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                min={0}
                required
              />
            </div>

            {/* Absent Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absent Threshold (minutes)
              </label>
              <input
                type="number"
                name="absent_threshold_minutes"
                value={formData.absent_threshold_minutes}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                min={0}
                required
              />
            </div>

            {/* Lates to Absent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lates to Equal One Absent
              </label>
              <input
                type="number"
                name="lates_to_absent"
                value={formData.lates_to_absent}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                min={1}
                placeholder="Optional"
              />
            </div>

            {/* Consecutive Absents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consecutive Absents to Fail
              </label>
              <input
                type="number"
                name="consecutive_absents_to_fail"
                value={formData.consecutive_absents_to_fail}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                min={1}
                placeholder="Optional"
              />
            </div>

            {/* Attendance Weight */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Weight (% of final grade)
              </label>
              <input
                type="number"
                name="attendance_weight"
                value={formData.attendance_weight}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                min={0}
                max={100}
                required
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                disabled={loading}
              >
                {isEditMode ? "Cancel" : "Close"}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isUpdating
                  ? "Update Policy"
                  : "Create Policy"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendancePolicyModal;
