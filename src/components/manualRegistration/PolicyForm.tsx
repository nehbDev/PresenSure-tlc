import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react"; // Correct type-only import
import toast, { Toaster } from "react-hot-toast";
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
  subjects: number[]; // Subject IDs selected
}

const PolicyForm = () => {
  const [formData, setFormData] = useState<PolicyFormData>({
    policy_name: "",
    late_threshold_minutes: 15,
    absent_threshold_minutes: 30,
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

      // If backend wraps subjects inside "data"
      const subjectsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      setSubjects(subjectsData || []);
    } catch (error) {
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
        absent_threshold_minutes: policy.absent_threshold_minutes || 30,
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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubjectChange = (subjectId: number) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      const errorMessage =
        error?.response?.data?.message || "Error saving policy";
      toast.error(errorMessage);
      console.error("Error saving policy:", error);
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
      <Toaster />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? "Edit Attendance Policy" : "Create Attendance Policy"}
        </h1>
        <p className="text-gray-600 mt-2">
          Define rules for how attendance affects student grades and status
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="policy_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Policy Name
            </label>
            <input
              type="text"
              id="policy_name"
              name="policy_name"
              value={formData.policy_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label
              htmlFor="is_global"
              className="ml-2 block text-sm text-gray-900"
            >
              Apply globally to all subjects
            </label>
          </div>
        </div>

        {!formData.is_global && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subjects
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={formData.subjects.includes(subject.id)}
                    onChange={() => handleSubjectChange(subject.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`subject-${subject.id}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {subject.subject_code} - {subject.description}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="late_threshold_minutes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Late Threshold (minutes)
            </label>
            <input
              type="number"
              id="late_threshold_minutes"
              name="late_threshold_minutes"
              value={formData.late_threshold_minutes}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="absent_threshold_minutes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Absent Threshold (minutes)
            </label>
            <input
              type="number"
              id="absent_threshold_minutes"
              name="absent_threshold_minutes"
              value={formData.absent_threshold_minutes}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lates_to_absent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lates to Equal One Absent
            </label>
            <input
              type="number"
              id="lates_to_absent"
              name="lates_to_absent"
              value={formData.lates_to_absent}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="consecutive_absents_to_fail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
        </div>

        <div>
          <label
            htmlFor="attendance_weight"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Attendance Weight (% of final grade)
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

        <div className="flex justify-end space-x-4 pt-4">
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
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : id ? "Update Policy" : "Create Policy"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;
