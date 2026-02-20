import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/ApiService";
import { toast } from "react-hot-toast";

// Types
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

  // Auth Helpers
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

  // State
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

  // HELPER: Handles number input changes with strict digit limits
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof PolicyData,
    maxLength: number
  ) => {
    const value = e.target.value;
    if (value === "" || value.length <= maxLength) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // HELPER: Blocks invalid characters
  const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Queries
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

  // Mutation
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

  // Filtering Logic
  const assignedCourseIds = policies
    .filter(
      (p: PolicyData) =>
        p.attendance_policy_id !== formData.attendance_policy_id
    )
    .flatMap(
      (p: PolicyData) => p.courses?.map((c: Course) => c.course_id) || []
    );

  const filteredCourses = availableCourses.filter(
    (course: Course) => !assignedCourseIds.includes(course.course_id)
  );

  const hasExistingDefault = policies.some(
    (p: PolicyData) =>
      Boolean(p.is_default) &&
      p.attendance_policy_id !== formData.attendance_policy_id
  );

  // Handlers
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleBackdropClick}></div>

      <div className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col relative z-10">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-700 text-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {forceCreate
                ? "Welcome! Please Set Your Attendance Policy"
                : viewMode === "list"
                ? "Attendance Policies"
                : formData.attendance_policy_id
                ? "Edit Attendance Policy"
                : "Create Attendance Policy"}
            </h2>
            {forceCreate && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 ml-2">
                Action Required
              </span>
            )}
          </div>
          {!forceCreate && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none transition-colors"
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
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-gray-500 mb-4">No policies found.</p>
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
                        className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between shadow-sm items-center"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {policy.policy_name}
                          </h3>
                          {Boolean(policy.is_default) ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block font-medium">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <button
                          onClick={() => handleEdit(policy)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  {policies.length > 0 && (
                    <button
                      onClick={handleCreateNew}
                      className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl mt-6 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + Create New Policy
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* FORM VIEW */}
          {viewMode === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Settings Card */}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Policy Name <span className="text-red-500">*</span>{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        (Max 10 chars)
                      </span>
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
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
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
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
                    {hasExistingDefault ? (
                      <div className="w-full text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <span className="font-semibold block mb-0.5">
                          Default Policy Active
                        </span>
                        You already have a global default policy set.
                      </div>
                    ) : (
                      <label
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg w-full border transition-colors ${
                          formData.is_default
                            ? "bg-blue-50 border-blue-300"
                            : "bg-gray-50 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.is_default)}
                          onChange={handleDefaultChange}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold block text-gray-800">
                            Set as Default Policy
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </section>

              {/* Grading Logic Card */}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">Grading Logic</h3>
                
                {formData.calculation_type === "deduction" ? (
                  <>
                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-6 border border-blue-100 flex items-start gap-3">
                      <div className="mt-0.5 font-bold">ℹ️</div>
                      <div>
                        <strong>Deduction Mode Active:</strong>
                        <br />
                        Students start with a perfect Base Score (100). Points are subtracted per infraction.
                        <br />
                        <span className="text-xs opacity-80 mt-1 block">
                          Define how many points are deducted for each Late or Absent record below.
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                          Base Score
                        </label>
                        <input
                          type="number"
                          value={formData.base_score}
                          onChange={(e) => handleNumberChange(e, "base_score", 3)}
                          onKeyDown={blockInvalidChar}
                          disabled
                          className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-all"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                          Absent Penalty (-)
                        </label>
                        <input
                          type="number"
                          value={formData.absent_penalty}
                          onChange={(e) => handleNumberChange(e, "absent_penalty", 3)}
                          onKeyDown={blockInvalidChar}
                          className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                          Late Penalty (-)
                        </label>
                        <input
                          type="number"
                          value={formData.late_penalty}
                          onChange={(e) => handleNumberChange(e, "late_penalty", 3)}
                          onKeyDown={blockInvalidChar}
                          className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-6 border border-blue-100 flex items-start gap-3">
                    <div className="mt-0.5 font-bold">ℹ️</div>
                    <div>
                      <strong>Accumulation Mode Active:</strong>
                      <br />
                      Students start at 0 and earn points per session attended.
                      <br />
                      <span className="text-xs opacity-80 mt-1 font-mono bg-white/50 p-1.5 rounded inline-block">
                        Present = 1.0 &nbsp;|&nbsp; Late = 0.5 &nbsp;|&nbsp;
                        Absent = 0
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                      Grade Weight (%)
                    </label>
                    <input
                      type="number"
                      max="30"
                      value={formData.attendance_weight}
                      onChange={(e) => handleNumberChange(e, "attendance_weight", 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                      Late Threshold (mins)
                    </label>
                    <input
                      type="number"
                      value={formData.late_threshold_minutes}
                      onChange={(e) => handleNumberChange(e, "late_threshold_minutes", 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                      Absent Threshold (mins)
                    </label>
                    <input
                      type="number"
                      value={formData.absent_threshold_minutes}
                      onChange={(e) => handleNumberChange(e, "absent_threshold_minutes", 3)}
                      onKeyDown={blockInvalidChar}
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Lates to Absent
                    </label>
                    <div className="text-[10px] text-gray-400 mb-2">
                      How many lates equal 1 absence?
                    </div>
                    <input
                      type="number"
                      value={formData.lates_to_absent}
                      onChange={(e) => handleNumberChange(e, "lates_to_absent", 2)}
                      onKeyDown={blockInvalidChar}
                      placeholder="e.g. 3"
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Consecutive Absents to Fail
                    </label>
                    <div className="text-[10px] text-gray-400 mb-2">
                      Fail student after this many straight absences
                    </div>
                    <input
                      type="number"
                      value={formData.consecutive_absents_to_fail}
                      onChange={(e) => handleNumberChange(e, "consecutive_absents_to_fail", 2)}
                      onKeyDown={blockInvalidChar}
                      placeholder="e.g. 5"
                      className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Course Selection Card */}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                {!formData.is_default ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Course Selection</h3>
                    <p className="text-sm text-gray-500 mb-4">Select the courses this policy will apply to.</p>
                    
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.isArray(filteredCourses) &&
                        filteredCourses.map((course: Course) => (
                          <label
                            key={course.course_id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                              formData.course_ids.includes(course.course_id)
                                ? "bg-blue-50 border-blue-600 shadow-sm"
                                : "bg-white border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.course_ids.includes(course.course_id)}
                              onChange={() => handleCourseToggle(course.course_id)}
                              className="w-4 h-4 text-blue-600 rounded mt-1 border-gray-300 cursor-pointer focus:ring-blue-600"
                            />
                            <div className="text-sm">
                              <div className="font-bold text-gray-800">
                                {course.subject_code}
                              </div>
                              <div
                                className="text-xs text-gray-500 truncate w-40 sm:w-48"
                                title={course.description}
                              >
                                {course.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      {filteredCourses.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No available courses found. All your courses might already be assigned.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h4 className="text-green-800 font-bold text-lg mb-2">
                      Global Default Policy
                    </h4>
                    <p className="text-green-700 text-sm max-w-md mx-auto">
                      This policy will automatically apply to all current and future courses that are not explicitly assigned to a specific custom policy.
                    </p>
                  </div>
                )}
              </section>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-2 pb-2">
                {!forceCreate && (
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className="px-6 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8 py-2.5 bg-blue-700 text-white rounded-lg font-medium shadow-md hover:bg-blue-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mutation.isPending
                    ? "Saving..."
                    : forceCreate
                    ? "Save & Continue"
                    : "Save Policy"}
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