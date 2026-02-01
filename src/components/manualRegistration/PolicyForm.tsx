import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast"; // ✅ Ensure Toaster is imported
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/ApiService";

interface Subject {
  id: number;
  subject_code: string;
  description: string;
}

interface PolicyFormData {
  policy_name: string;
  late_threshold_minutes: number;
  absent_threshold_minutes: number;
  lates_to_absent?: number;
  consecutive_absents_to_fail?: number;
  attendance_weight?: number;
  is_global: boolean;
  subjects: number[];
}

const PolicyForm = () => {
  const [formData, setFormData] = useState<PolicyFormData>({
    policy_name: "",
    late_threshold_minutes: 15,
    absent_threshold_minutes: 60,
    lates_to_absent: 3,
    consecutive_absents_to_fail: 5,
    attendance_weight: 10,
    is_global: false,
    subjects: [],
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    fetchInstructorSubjects();

    if (id) {
      fetchPolicy();
    } else {
      setPageLoading(false);
    }
  }, [id]);

  const fetchInstructorSubjects = async () => {
    try {
      const response = await apiService.get<{ data: Subject[] }>("/instructor-subjects", config);
      const subjectsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data;
      setSubjects(subjectsData || []);
    } catch (error) {
      // 🔔 Toast for loading error
      toast.error("Error fetching subjects");
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchPolicy = async () => {
    try {
      const response = await apiService.get<{ data: PolicyFormData }>(
        "/attendance-policies/" + id
      );
      const policy = response.data.data;

      setFormData({
        policy_name: policy.policy_name || "",
        late_threshold_minutes: policy.late_threshold_minutes || 15,
        absent_threshold_minutes: policy.absent_threshold_minutes || 60,
        lates_to_absent: policy.lates_to_absent || 3,
        consecutive_absents_to_fail: policy.consecutive_absents_to_fail || 5,
        attendance_weight: policy.attendance_weight || 10,
        is_global: policy.is_global || false,
        subjects: policy.subjects || [],
      });
    } catch (error) {
      toast.error("Error fetching policy details");
      console.error("Error fetching policy:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      // Logic: If Global is checked, clear specific subjects
      if (name === "is_global") {
        return {
          ...prev,
          is_global: checked,
          subjects: checked ? [] : prev.subjects,
        };
      }

      return {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseInt(value) || 0
            : value,
      };
    });
  };

  const handleSubjectChange = (subjectId: number) => {
    if (formData.is_global) return;

    setFormData((prev) => {
      const exists = prev.subjects.includes(subjectId);
      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((id) => id !== subjectId)
          : [...prev.subjects, subjectId],
      };
    });
  };

  // ✅ VALIDATION FUNCTION (Shows Toasts)
  const validateForm = () => {
    // 1. Check Threshold Logic
    if (
      formData.absent_threshold_minutes > 0 &&
      formData.late_threshold_minutes >= formData.absent_threshold_minutes
    ) {
      toast.error("Late threshold must be strictly less than Absent threshold."); // 🔔 Toast
      return false;
    }

    // 2. Check Weight Logic
    if ((formData.attendance_weight ?? 0) < 0 || (formData.attendance_weight ?? 0) > 100) {
      toast.error("Attendance weight must be between 0% and 100%."); // 🔔 Toast
      return false;
    }

    // 3. Check Lates Logic
    if ((formData.lates_to_absent ?? 0) === 1) {
      toast.error("Lates to Absent must be at least 2. (If 1, just mark them Absent directly)."); // 🔔 Toast
      return false;
    }

    // 4. Check Subject Selection
    if (!formData.is_global && formData.subjects.length === 0) {
      toast.error("Please select at least one subject, or enable Global Policy."); // 🔔 Toast
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Run Client-Side Validation First
    if (!validateForm()) {
      return; 
    }

    setLoading(true);

    try {
      if (id) {
        await apiService.put(`/attendance-policies/${id}`, formData, config);
        toast.success("Policy updated successfully");
      } else {
        await apiService.post("/attendance-policies", formData, config);
        toast.success("Policy created successfully");
      }

      setTimeout(() => navigate("/attendance-policies"), 1000);
    } catch (error: any) {
      console.error("Full Error Object:", error); // Check console for structure

      // --- FIXED ERROR HANDLING ---
      
      // 1. Check if it's a Validation Error (Status 422)
      if (error.response && error.response.status === 422) {
          const responseData = error.response.data;

          // Laravel sends errors in an "errors" object: { field_name: ["Error message"] }
          if (responseData.errors) {
              // Get the first error message found
              const firstField = Object.keys(responseData.errors)[0];
              const firstErrorMessage = responseData.errors[firstField][0];
              
              toast.error(firstErrorMessage); // Show "Late threshold must be strictly less..."
          } else {
              // Fallback if "errors" object is missing but status is 422
              toast.error(responseData.message || "Validation failed. Please check your inputs.");
          }
      } 
      // 2. Handle other errors (500, 403, etc.)
      else {
          const genericMessage = error?.response?.data?.message || "An unexpected error occurred.";
          toast.error(genericMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/attendance-policies");
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading policy details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* ✅ IMPORTANT: Toaster must be rendered for toasts to show */}
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? "Edit Attendance Policy" : "Create Attendance Policy"}
        </h1>
        <p className="text-gray-600 mt-2">
          Define rules for how attendance affects student grades and status
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name and Global Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="policy_name" className="block text-sm font-medium text-gray-700 mb-1">
              Policy Name
            </label>
            <input
              type="text"
              id="policy_name"
              name="policy_name"
              value={formData.policy_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Strict Lab Policy"
              required
            />
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="is_global"
              name="is_global"
              checked={formData.is_global}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-2">
              <label htmlFor="is_global" className="block text-sm font-medium text-gray-900">
                Apply globally to all subjects
              </label>
              <p className="text-xs text-gray-500">Overrides selection below</p>
            </div>
          </div>
        </div>

        {/* Row 2: Subject Selection */}
        <div className={`transition-opacity duration-200 ${formData.is_global ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subjects {formData.is_global && "(Disabled because Global Policy is active)"}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={formData.subjects.includes(subject.id)}
                    onChange={() => handleSubjectChange(subject.id)}
                    disabled={formData.is_global}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`subject-${subject.id}`}
                    className="ml-2 block text-sm text-gray-900 cursor-pointer"
                  >
                    <span className="font-semibold">{subject.subject_code}</span> - {subject.description}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-2">No subjects found assigned to you.</p>
            )}
          </div>
        </div>

        {/* Row 3: Thresholds */}
        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Time Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="late_threshold_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                id="late_threshold_minutes"
                name="late_threshold_minutes"
                value={formData.late_threshold_minutes}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Before this time: Present. After: Late.</p>
            </div>

            <div>
              <label htmlFor="absent_threshold_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                Absent Threshold (minutes)
              </label>
              <input
                type="number"
                id="absent_threshold_minutes"
                name="absent_threshold_minutes"
                value={formData.absent_threshold_minutes}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Set to <strong>0</strong> to disable auto-absent.</p>
            </div>
          </div>
        </div>

        {/* Row 4: Grading Logic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="lates_to_absent" className="block text-sm font-medium text-gray-700 mb-1">
              Lates = 1 Absent
            </label>
            <input
              type="number"
              id="lates_to_absent"
              name="lates_to_absent"
              value={formData.lates_to_absent}
              onChange={handleChange}
              min="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="consecutive_absents_to_fail" className="block text-sm font-medium text-gray-700 mb-1">
              Consecutive Absents to Fail
            </label>
            <input
              type="number"
              id="consecutive_absents_to_fail"
              name="consecutive_absents_to_fail"
              value={formData.consecutive_absents_to_fail}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="attendance_weight" className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Weight (%)
            </label>
            <input
              type="number"
              id="attendance_weight"
              name="attendance_weight"
              value={formData.attendance_weight}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {id ? "Update Policy" : "Create Policy"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;