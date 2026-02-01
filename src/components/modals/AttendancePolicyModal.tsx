import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/ApiService";
import { toast } from "react-hot-toast";

interface PolicyFormData {
  late_threshold_minutes: number | string;
  absent_threshold_minutes: number | string;
  lates_to_absent?: number | string;
  consecutive_absents_to_fail?: number | string;
  attendance_weight?: number | string;
}

interface AttendancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  forceCreate?: boolean;
}

const AttendancePolicyModal: React.FC<AttendancePolicyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  forceCreate = false,
}) => {
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState<PolicyFormData>({
    late_threshold_minutes: 15,
    absent_threshold_minutes: 60,
    lates_to_absent: 3,
    consecutive_absents_to_fail: 5,
    attendance_weight: 10,
  });

  // UI State
  const [hasExistingPolicy, setHasExistingPolicy] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 1. FETCH DATA
  const {
    data: policyData,
    isLoading: isFetchLoading,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["attendancePolicy", "my"],
    queryFn: async () => {
      const response = await apiService.get<{ data: any }>(
        "/attendance-policy/my",
        config
      );
      return response.data.data;
    },
    enabled: isOpen,
    retry: false,
  });

  // 2. SYNC DATA TO FORM STATE
  useEffect(() => {
    if (isSuccess && policyData) {
      setFormData(policyData);
      setHasExistingPolicy(true);
      setIsEditMode(false);
    } else if (isError) {
      const err = error as any;
      if (err.response?.status === 404) {
        setHasExistingPolicy(false);
        setIsEditMode(true);
      } else {
        toast.error("Failed to load policy");
      }
    }
  }, [isSuccess, policyData, isError, error]);

  // ✅ 3. FIX: IMPLEMENT THE MUTATION LOGIC HERE
  const mutation = useMutation({
    mutationFn: async (data: PolicyFormData) => {
      return await apiService.post("/attendance-policy/my", data, config);
    },
    onSuccess: () => {
      toast.success(
        hasExistingPolicy
          ? "Policy updated successfully"
          : "Policy created successfully"
      );
      setHasExistingPolicy(true);
      setIsEditMode(false);
      
      // Invalidate query so data re-fetches next time
      queryClient.invalidateQueries({ queryKey: ["attendancePolicy", "my"] });
      
      onSave(); // Call the parent onSave prop
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      if (error.response && error.response.status === 422) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const firstField = Object.keys(responseData.errors)[0];
          const firstErrorMessage = responseData.errors[firstField][0];
          toast.error(firstErrorMessage);
        } else {
          toast.error(responseData.message || "Validation failed.");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to save policy");
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = value === "" ? "" : parseInt(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const validateForm = () => {
    const late = Number(formData.late_threshold_minutes);
    const absent = Number(formData.absent_threshold_minutes);
    const weight = Number(formData.attendance_weight);
    const latesToAbsent = Number(formData.lates_to_absent);

    if (formData.late_threshold_minutes === "") {
      toast.error("Late Threshold required");
      return false;
    }
    if (formData.absent_threshold_minutes === "") {
      toast.error("Absent Threshold required");
      return false;
    }
    if (formData.attendance_weight === "") {
      toast.error("Attendance Weight required");
      return false;
    }

    if (absent > 0 && late >= absent) {
      toast.error("Late threshold must be strictly less than Absent.");
      return false;
    }
    if (weight < 0 || weight > 30) {
      toast.error("Weight must be 0-30%.");
      return false;
    }
    if (formData.lates_to_absent !== "" && latesToAbsent < 2) {
      toast.error("Lates to Absent must be at least 2.");
      return false;
    }
    if (late < 0 || absent < 0) {
      toast.error("No negative values.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // ✅ Use the mutation to save data
    mutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    if (forceCreate && !hasExistingPolicy) return;

    if (hasExistingPolicy) {
      if (isEditMode) {
        setIsEditMode(false);
        if (policyData) setFormData(policyData);
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isFetchLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">Loading policy...</span>
          </div>
        </div>
      </div>
    );
  }

  const showForm = !hasExistingPolicy || isEditMode;
  const isUpdating = hasExistingPolicy && isEditMode;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
      <div
        className="absolute inset-0"
        onClick={() => !forceCreate && onClose()}
      />

      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all z-10 relative border border-gray-100">
        {forceCreate && !hasExistingPolicy && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium flex items-center shadow-sm">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">Action Required</p>
              <p>
                You must set an attendance policy before accessing the
                dashboard.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          
          {showForm
            ? isUpdating
              ? "Edit Policy"
              : "Set Attendance Policy"
            : "Attendance Policy"}
        </h2>

        {!showForm ? (
          // --- VIEW MODE ---
          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
                Time Thresholds
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Late Threshold
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {formData.late_threshold_minutes}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      mins
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Absent Threshold
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {formData.absent_threshold_minutes === 0
                      ? "Disabled"
                      : `${formData.absent_threshold_minutes}`}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      {formData.absent_threshold_minutes !== 0 && "mins"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 px-2">
              <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Lates = 1 Absent
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {formData.lates_to_absent || "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Absents to Fail
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {formData.consecutive_absents_to_fail || "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <label className="block text-xs font-medium text-blue-600 mb-1">
                  Weight
                </label>
                <p className="text-lg font-bold text-blue-700">
                  {formData.attendance_weight}%
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Edit Policy
              </button>
            </div>
          </div>
        ) : (
          // --- EDIT/CREATE MODE ---
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full mr-2"></span>
                Time Thresholds
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Late Threshold (mins){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="late_threshold_minutes"
                    value={formData.late_threshold_minutes}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Before: Present. After: Late.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Absent Threshold (mins){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="absent_threshold_minutes"
                    value={formData.absent_threshold_minutes}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Set to <strong>0</strong> to disable auto-absent.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Lates = 1 Absent
                </label>
                <input
                  type="number"
                  name="lates_to_absent"
                  value={formData.lates_to_absent}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Absents to Fail
                </label>
                <input
                  type="number"
                  name="consecutive_absents_to_fail"
                  value={formData.consecutive_absents_to_fail}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Weight (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="attendance_weight"
                  value={formData.attendance_weight}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min={0}
                  max={30}
                />
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  Max 30%
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              {!(forceCreate && !hasExistingPolicy) && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  disabled={mutation.isPending}
                >
                  {isEditMode && hasExistingPolicy ? "Cancel" : "Close"}
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isUpdating ? "Update Policy" : "Save & Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendancePolicyModal;