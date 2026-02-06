import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/ApiService";
import { toast } from "react-hot-toast";

// --- Types ---
interface Course {
  course_id: number;
  subject_code: string;
  description: string;
}

interface PolicyData {
  attendance_policy_id?: number;
  policy_name: string;
  is_default: boolean;
  calculation_type: "accumulation" | "deduction";
  late_threshold_minutes: number | string;
  absent_threshold_minutes: number | string;
  lates_to_absent: number | string;
  consecutive_absents_to_fail: number | string;
  attendance_weight: number | string;
  base_score: number | string;
  absent_penalty: number | string;
  late_penalty: number | string;
  course_ids: number[];
  courses?: Course[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  forceCreate?: boolean;
}

const AttendancePolicyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  forceCreate = false,
}) => {
  const queryClient = useQueryClient();

  // --- Auth Helpers ---
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const getUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };
  const currentUser = getUser();

  // --- State ---
  const [viewMode, setViewMode] = useState<"list" | "form">(
    forceCreate ? "form" : "list"
  );

  useEffect(() => {
    if (forceCreate) setViewMode("form");
  }, [forceCreate]);

  const defaultForm: PolicyData = {
    policy_name: "",
    is_default: false,
    calculation_type: "accumulation",
    late_threshold_minutes: 15,
    absent_threshold_minutes: 60,
    lates_to_absent: 3,
    consecutive_absents_to_fail: 5,
    attendance_weight: 10,
    base_score: 100,
    absent_penalty: 5,
    late_penalty: 2.5,
    course_ids: [],
  };

  const [formData, setFormData] = useState<PolicyData>(defaultForm);

  // ✅ HELPER: Handles number input changes with strict digit limits
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof PolicyData,
    maxLength: number
  ) => {
    const value = e.target.value;
    // Only update if value is empty OR within the character limit
    if (value === "" || value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ✅ HELPER: Blocks invalid characters like 'e', '+', '-'
  const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // --- Queries ---
  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ["attendancePolicies"],
    queryFn: async () => {
      const res = await apiService.get<{ data: PolicyData[] }>(
        "/attendance-policy/my",
        getAuthConfig()
      );
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  const { data: availableCourses = [] } = useQuery({
    queryKey: ["myActiveCourses"],
    queryFn: async () => {
      if (!currentUser) return [];
      const userId = currentUser.user_id || currentUser.id;
      const userRole = currentUser.role || "instructor";
      if (!userId) return [];

      try {
        const res = await apiService.get<any>("/getCourses", {
          ...getAuthConfig(),
          params: { user_id: userId, role: userRole },
        });
        return res.data.my_records || [];
      } catch (error: any) {
        return [];
      }
    },
    enabled: isOpen && viewMode === "form" && !!currentUser,
  });

  // --- Mutation ---
  const mutation = useMutation({
    mutationFn: async (data: PolicyData) => {
      return await apiService.post(
        "/attendance-policy/my",
        data,
        getAuthConfig()
      );
    },
    onSuccess: () => {
      toast.success("Policy saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendancePolicies"] });

      if (forceCreate && onSave) {
        onSave();
      } else {
        setViewMode("list");
      }
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        toast.error(err.response.data.errors[firstErrorKey][0]);
      } else {
        toast.error(err.response?.data?.message || "Failed to save policy");
      }
    },
  });

  // --- Handlers ---
  const handleCreateNew = () => {
    setFormData(defaultForm);
    setViewMode("form");
  };

  const handleEdit = (policy: PolicyData) => {
    const existingIds = policy.courses?.map((c) => c.course_id) || [];
    setFormData({ ...policy, course_ids: existingIds });
    setViewMode("form");
  };

  const handleCourseToggle = (courseId: number) => {
    setFormData((prev) => {
      const exists = prev.course_ids.includes(courseId);
      return {
        ...prev,
        course_ids: exists
          ? prev.course_ids.filter((id) => id !== courseId)
          : [...prev.course_ids, courseId],
      };
    });
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      is_default: isChecked,
      course_ids: isChecked ? [] : prev.course_ids,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleBackdropClick = () => {
    if (!forceCreate) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleBackdropClick}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {forceCreate
                ? "Welcome! Please Set Your Attendance Policy"
                : viewMode === "list"
                ? "Attendance Policies"
                : formData.attendance_policy_id
                ? "Edit Policy"
                : "Create Policy"}
            </h2>
            {forceCreate && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                Action Required
              </span>
            )}
          </div>
          {!forceCreate && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
          
          {/* LIST VIEW */}
          {viewMode === "list" && !forceCreate && (
            <div className="space-y-4">
              {loadingPolicies ? (
                <div className="flex justify-center p-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {policies.length === 0 && (
                    <div className="text-center py-10">
                      <button
                        onClick={handleCreateNew}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Create your first one
                      </button>
                    </div>
                  )}
                  <div className="grid gap-4">
                    {policies.map((policy: PolicyData) => (
                      <div
                        key={policy.attendance_policy_id}
                        className="border border-gray-200 rounded-xl p-5 flex justify-between"
                      >
                        <div>
                          <h3 className="font-bold">{policy.policy_name}</h3>
                          {policy.is_default && (
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleEdit(policy)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCreateNew}
                    className="w-full py-4 border-2 border-dashed mt-6"
                  >
                    + Create New Policy
                  </button>
                </>
              )}
            </div>
          )}

          {/* FORM VIEW */}
          {viewMode === "form" && (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* --- General Settings --- */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Policy Name <span className="text-gray-400 font-normal text-xs">(Max 10 chars)</span>
                    </label>
                    <input
                      className="w-full border p-2.5 rounded-lg"
                      value={formData.policy_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policy_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Strict"
                      maxLength={10} 
                      required
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {formData.policy_name.length}/10
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Calculation Type
                    </label>
                    <select
                      className="w-full border p-2.5 rounded-lg bg-white"
                      value={formData.calculation_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          calculation_type: e.target.value as any,
                        })
                      }
                    >
                      <option value="accumulation">Accumulation</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label
                      className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg w-full border ${
                        formData.is_default
                          ? "bg-green-50 border-green-200"
                          : "border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(formData.is_default)}
                        onChange={handleDefaultChange}
                        className="w-5 h-5 text-green-600"
                      />
                      <div>
                        <span className="font-semibold block">
                          Set as Default Policy
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              {/* --- Grading Logic --- */}
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                
                {formData.calculation_type === 'deduction' ? (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Base Score</label>
                      <input 
                        type="number" 
                        value={formData.base_score} 
                        onChange={(e) => handleNumberChange(e, 'base_score', 3)} 
                        onKeyDown={blockInvalidChar}
                        className="w-full border p-2 rounded-lg bg-white" 
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Absent Penalty (-)</label>
                      <input 
                        type="number" 
                        value={formData.absent_penalty} 
                        onChange={(e) => handleNumberChange(e, 'absent_penalty', 3)} 
                        onKeyDown={blockInvalidChar}
                        className="w-full border p-2 rounded-lg bg-white" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Late Penalty (-)</label>
                      <input 
                        type="number" 
                        value={formData.late_penalty} 
                        onChange={(e) => handleNumberChange(e, 'late_penalty', 3)} 
                        onKeyDown={blockInvalidChar}
                        className="w-full border p-2 rounded-lg bg-white" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-6 border border-blue-100 flex items-start gap-3">
                    <div className="mt-0.5">ℹ️</div>
                    <div>
                      <strong>Accumulation Mode Active:</strong><br/>
                      Students start at 0 and earn points per session.<br/>
                      <span className="text-xs opacity-80 mt-1 block">Present = 1.0 &nbsp;|&nbsp; Late = 0.5 &nbsp;|&nbsp; Absent = 0</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Grade Weight (%)
                    </label>
                    <input
                      type="number"
                      max="30"
                      value={formData.attendance_weight}
                      onChange={(e) => handleNumberChange(e, 'attendance_weight', 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border p-2 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Late Threshold (mins)
                    </label>
                    <input
                      type="number"
                      value={formData.late_threshold_minutes}
                      onChange={(e) => handleNumberChange(e, 'late_threshold_minutes', 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border p-2 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Absent Threshold (mins)
                    </label>
                    <input
                      type="number"
                      value={formData.absent_threshold_minutes}
                      onChange={(e) => handleNumberChange(e, 'absent_threshold_minutes', 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border p-2 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* --- Course Selection --- */}
              {!formData.is_default ? (
                <section>
                  <div className="flex justify-between items-end mb-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">
                      Apply to Specific Courses *
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Array.isArray(availableCourses) &&
                      availableCourses.map((course: Course) => (
                        <label
                          key={course.course_id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                            formData.course_ids.includes(course.course_id)
                              ? "bg-blue-50 border-blue-300 shadow-sm"
                              : "bg-white border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.course_ids.includes(course.course_id)}
                            onChange={() => handleCourseToggle(course.course_id)}
                            className="w-4 h-4 text-blue-600 rounded mt-1 cursor-pointer"
                          />
                          <div className="text-sm">
                            <div className="font-bold text-gray-800">{course.subject_code}</div>
                            <div className="text-xs text-gray-500 truncate w-48" title={course.description}>{course.description}</div>
                          </div>
                        </label>
                      ))}
                    {availableCourses.length === 0 && (
                      <div className="col-span-2 text-center py-6 text-gray-500">No courses found.</div>
                    )}
                  </div>
                </section>
              ) : (
                <section className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <h4 className="text-green-800 font-bold">Global Default Policy</h4>
                  <p className="text-green-700 text-sm">Applies to all courses not explicitly assigned.</p>
                </section>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                {!forceCreate && (
                  <button type="button" onClick={() => setViewMode("list")} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                )}
                <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
                  {mutation.isPending ? "Saving..." : forceCreate ? "Save & Continue" : "Save Policy"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePolicyModal;