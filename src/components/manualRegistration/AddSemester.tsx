import React, { useState } from "react";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PeriodName = "Prelim" | "Midterm" | "Prefinal" | "Finals";

interface PeriodFormData {
  name: PeriodName;
  start_date: string;
  end_date: string;
}

export interface SemesterFormData {
  description: string;
  status: "active" | "inactive";
  schoolyear_start: string;
  schoolyear_end: string;
  semester_start: string;
  semester_end: string;
  periods: PeriodFormData[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

const periodNamesOrder: PeriodName[] = [
  "Prelim",
  "Midterm",
  "Prefinal",
  "Finals",
];

const DateInput: React.FC<{
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, value, min, max, onChange, required = false }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 block mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm"
      required={required}
    />
  </div>
);

const AddSemester: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<SemesterFormData>({
    description: "",
    status: "inactive",
    schoolyear_start: "",
    schoolyear_end: "",
    semester_start: "",
    semester_end: "",
    periods: [],
  });

  const { mutate: createSemester, isPending } = useMutation({
    mutationFn: async (newSemester: SemesterFormData) => {
      return await apiService.post<ApiResponse<any>>("/semesters", newSemester);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      navigate("/semester", {
        state: { successMessage: "Semester created successfully!" },
        replace: true,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error creating semester.");
    },
  });

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const years = Array.from({ length: 6 }, (_, i) =>
    (new Date().getFullYear() - 1 + i).toString(),
  );

  const validateStep1 = () => {
    const { description, schoolyear_start, semester_start, semester_end } =
      formData;
    if (!description || !schoolyear_start || !semester_start || !semester_end) {
      toast.error("Please fill in all required semester information.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.periods.length === 0) {
      toast.error("Please add at least one period.");
      return false;
    }
    return (
      formData.periods.every((p) => p.start_date && p.end_date) ||
      (toast.error("Please complete all period dates."), false)
    );
  };

  const addNextPeriod = () => {
    if (formData.periods.length >= periodNamesOrder.length) return;

    const lastPeriod = formData.periods[formData.periods.length - 1];
    if (lastPeriod && (!lastPeriod.start_date || !lastPeriod.end_date)) {
      toast.error("Complete the current period before adding a new one.");
      return;
    }

    const nextName = periodNamesOrder[formData.periods.length];
    let start = formData.periods.length === 0 ? formData.semester_start : "";

    if (formData.periods.length > 0) {
      const prevEnd = new Date(lastPeriod.end_date);
      prevEnd.setDate(prevEnd.getDate() + 1);
      start = prevEnd.toISOString().split("T")[0];
    }

    const end =
      formData.periods.length === periodNamesOrder.length - 1
        ? formData.semester_end
        : "";

    setFormData((f) => ({
      ...f,
      periods: [
        ...f.periods,
        { name: nextName, start_date: start, end_date: end },
      ],
    }));
  };

  const removeLastPeriod = () => {
    setFormData((f) => ({ ...f, periods: f.periods.slice(0, -1) }));
  };

  const updatePeriod = (
    index: number,
    field: "start_date" | "end_date",
    value: string,
  ) => {
    setFormData((f) => ({
      ...f,
      periods: f.periods.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const Stepper = () => {
    const steps = ["Semester Information", "Period Setup", "Review & Confirm"];
    return (
      <div className="flex justify-center mt-6 mb-8">
        <div className="flex items-center w-full max-w-4xl">
          {steps.map((label, index) => {
            const currentStep = index + 1;
            const isCompleted = step > currentStep;
            const isActive = step === currentStep;
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition shadow ${isActive || isCompleted ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}
                  >
                    {currentStep}
                  </div>
                  <p className="mt-2 text-sm text-center whitespace-nowrap">
                    {label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition shadow ${step > currentStep ? "bg-blue-600" : "bg-blue-300"}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Semesters", to: "/semester" },
          { label: "Add Semester" },
        ]}
      />
      <Stepper />

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 shadow">
                <h4 className="font-semibold text-white">
                  Semester Information
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Semester Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
                      >
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          School Year Start{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.schoolyear_start}
                          onChange={(e) =>
                            setFormData((f) => ({
                              ...f,
                              schoolyear_start: e.target.value,
                              schoolyear_end: e.target.value
                                ? (parseInt(e.target.value) + 1).toString()
                                : "",
                            }))
                          }
                          className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
                        >
                          <option value="">Select Year</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          School Year End
                        </label>
                        <input
                          value={formData.schoolyear_end}
                          readOnly
                          className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-400 bg-gray-100 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <DateInput
                      label="Semester Start Date"
                      value={formData.semester_start}
                      min={`${formData.schoolyear_start}-01-01`}
                      max={`${formData.schoolyear_end}-12-31`}
                      onChange={(val) =>
                        setFormData((f) => ({ ...f, semester_start: val }))
                      }
                      required
                    />
                    <DateInput
                      label="Semester End Date"
                      value={formData.semester_end}
                      min={
                        formData.semester_start ||
                        `${formData.schoolyear_start}-01-01`
                      }
                      max={`${formData.schoolyear_end}-12-31`}
                      onChange={(val) =>
                        setFormData((f) => ({ ...f, semester_end: val }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add academic periods in order: Prelim, Midterm, Prefinal, Finals
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.periods.map((period, index) => (
                <div
                  key={period.name}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold text-gray-700">
                      {period.name}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Period {index + 1}
                      </span>
                      {index === formData.periods.length - 1 && (
                        <button
                          type="button"
                          onClick={removeLastPeriod}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Remove this period"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput
                      label="Start Date"
                      value={period.start_date}
                      min={formData.semester_start}
                      max={formData.semester_end}
                      onChange={(val) => updatePeriod(index, "start_date", val)}
                      required
                    />
                    <DateInput
                      label="End Date"
                      value={period.end_date}
                      min={period.start_date || formData.semester_start}
                      max={formData.semester_end}
                      onChange={(val) => updatePeriod(index, "end_date", val)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {formData.periods.length > 0 && (
                <button
                  type="button"
                  onClick={removeLastPeriod}
                  className="flex-1 py-2 px-4 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition shadow-sm font-medium"
                >
                  Remove Last
                </button>
              )}
              <button
                type="button"
                onClick={addNextPeriod}
                disabled={
                  formData.periods.length === periodNamesOrder.length ||
                  (formData.periods.length > 0 &&
                    (!formData.periods.at(-1)?.start_date ||
                      !formData.periods.at(-1)?.end_date))
                }
                className={`flex-[2] py-2 px-4 rounded-md transition font-medium ${formData.periods.length === periodNamesOrder.length || (formData.periods.length > 0 && (!formData.periods.at(-1)?.start_date || !formData.periods.at(-1)?.end_date)) ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"}`}
              >
                {formData.periods.length === 0
                  ? "Add First Period"
                  : "Add Next Period"}
              </button>
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md shadow transition"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-4 py-3 shadow">
                  <h4 className="font-semibold text-white">
                    Semester Information
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">
                      Description
                    </span>
                    <span className="text-sm text-gray-800 font-medium">
                      {formData.description || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">
                      School Year
                    </span>
                    <span className="text-sm text-gray-800 font-medium">
                      {formData.schoolyear_start} - {formData.schoolyear_end}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block">
                      Semester Dates
                    </span>
                    <span className="text-sm text-gray-800 font-medium">
                      {formatDate(formData.semester_start)} to{" "}
                      {formatDate(formData.semester_end)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-4 py-3 shadow">
                  <h4 className="font-semibold text-white">
                    Period Information
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  {formData.periods.map((p) => (
                    <div
                      key={p.name}
                      className="border-b border-gray-100 pb-2 last:border-b-0"
                    >
                      <span className="text-xs font-medium text-gray-500 block">
                        {p.name}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {formatDate(p.start_date)} to {formatDate(p.end_date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md shadow transition"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition disabled:bg-blue-300 flex items-center gap-2"
                onClick={() =>
                  createSemester({ ...formData, status: "inactive" })
                }
              >
                {isPending ? "Processing..." : "Confirm & Create Semester"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSemester;
