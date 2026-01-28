import React, { useState } from "react";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SemesterEditSkeleton from "../contentLoader/SemesterEditSkeleton";

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

const periodNamesOrder: PeriodName[] = ["Prelim", "Midterm", "Prefinal", "Finals"];

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

const EditSemester: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
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

  // 1. Fetch Existing Data
  const { isLoading: isFetching } = useQuery({
    queryKey: ["semester_edit", id],
    queryFn: async () => {
      const res = await apiService.get<{ data: any }>(`/semester/${id}/details`);
      const data = res.data.data;
      // Pre-fill the form state
      setFormData({
        description: data.description,
        status: data.status,
        schoolyear_start: data.schoolyear_start.toString(),
        schoolyear_end: data.schoolyear_end.toString(),
        semester_start: data.semester_start,
        semester_end: data.semester_end,
        periods: data.periods.map((p: any) => ({
          name: p.name,
          start_date: p.start_date,
          end_date: p.end_date,
        })),
      });
      return data;
    },
    enabled: !!id,
  });

  // 2. Mutation for Updating
  const { mutate: updateSemester, isPending } = useMutation({
    mutationFn: async (updatedData: SemesterFormData) => {
      return await apiService.put(`/semester/${id}/update`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["semester_details", id] });
      navigate("/semester", {
        state: { successMessage: "Semester updated successfully!" },
        replace: true,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error updating semester.");
    },
  });

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());

  const validateStep1 = () => {
    const { description, schoolyear_start, semester_start, semester_end } = formData;
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
    return formData.periods.every((p) => p.start_date && p.end_date) || (toast.error("Please complete all period dates."), false);
  };

  const addNextPeriod = () => {
    if (formData.periods.length >= periodNamesOrder.length) return;
    const nextName = periodNamesOrder[formData.periods.length];
    setFormData((f) => ({
      ...f,
      periods: [...f.periods, { name: nextName, start_date: "", end_date: "" }],
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition shadow ${isActive || isCompleted ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                    {currentStep}
                  </div>
                  <p className="mt-2 text-sm text-center whitespace-nowrap">{label}</p>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition shadow ${step > currentStep ? "bg-blue-600" : "bg-blue-300"}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        <Breadcrumbs crumbs={[{ label: "Semesters", to: "/semester" }, { label: "Edit Semester" }]} />
        <SemesterEditSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs crumbs={[{ label: "Semesters", to: "/semester" }, { label: "Semester Details", to: `/semester/details?id=${id}` }, { label: "Edit Semester" }]} />
      <Stepper />

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 shadow">
                <h4 className="font-semibold text-white">Edit Semester Information</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Semester Description <span className="text-red-500">*</span></label>
                      <select value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm">
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">School Year Start <span className="text-red-500">*</span></label>
                        <select value={formData.schoolyear_start} onChange={(e) => setFormData(f => ({ ...f, schoolyear_start: e.target.value, schoolyear_end: e.target.value ? (parseInt(e.target.value) + 1).toString() : "" }))} className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm">
                          <option value="">Select Year</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">School Year End</label>
                        <input value={formData.schoolyear_end} readOnly className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-400 bg-gray-100 shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <DateInput label="Semester Start Date" value={formData.semester_start} min={`${formData.schoolyear_start}-01-01`} max={`${formData.schoolyear_end}-12-31`} onChange={(val) => setFormData(f => ({ ...f, semester_start: val }))} required />
                    <DateInput label="Semester End Date" value={formData.semester_end} min={formData.semester_start || `${formData.schoolyear_start}-01-01`} max={`${formData.schoolyear_end}-12-31`} onChange={(val) => setFormData(f => ({ ...f, semester_end: val }))} required />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Modify academic periods in order: Prelim, Midterm, Prefinal, Finals</p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.periods.map((period, index) => (
                <div key={period.name} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold text-gray-700">{period.name}</h5>
                    <span className="text-xs text-gray-500">Period {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput label="Start Date" value={period.start_date} min={formData.semester_start} max={formData.semester_end} onChange={(val) => setFormData(f => ({ ...f, periods: f.periods.map((p, i) => i === index ? { ...p, start_date: val } : p) }))} required />
                    <DateInput label="End Date" value={period.end_date} min={period.start_date || formData.semester_start} max={formData.semester_end} onChange={(val) => setFormData(f => ({ ...f, periods: f.periods.map((p, i) => i === index ? { ...p, end_date: val } : p) }))} required />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addNextPeriod} disabled={formData.periods.length === periodNamesOrder.length} className={`w-full py-2 px-4 rounded-md transition font-medium ${formData.periods.length === periodNamesOrder.length ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"}`}>
              Add Next Period
            </button>
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md shadow transition" onClick={() => setStep(1)}>Back</button>
              <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-4 py-3 shadow"><h4 className="font-semibold text-white">Review Semester Information</h4></div>
                <div className="p-4 space-y-3">
                  <div><span className="text-xs font-medium text-gray-500 block">Description</span><span className="text-sm text-gray-800 font-medium">{formData.description || "N/A"}</span></div>
                  <div><span className="text-xs font-medium text-gray-500 block">School Year</span><span className="text-sm text-gray-800 font-medium">{formData.schoolyear_start} - {formData.schoolyear_end}</span></div>
                  <div><span className="text-xs font-medium text-gray-500 block">Semester Dates</span><span className="text-sm text-gray-800 font-medium">{formatDate(formData.semester_start)} to {formatDate(formData.semester_end)}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-4 py-3 shadow"><h4 className="font-semibold text-white">Review Period Information</h4></div>
                <div className="p-4 space-y-3">
                  {formData.periods.map((p) => (
                    <div key={p.name} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <span className="text-xs font-medium text-gray-500 block">{p.name}</span>
                      <span className="text-sm text-gray-800 font-medium">{formatDate(p.start_date)} to {formatDate(p.end_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md shadow transition" onClick={() => setStep(2)}>Back</button>
              <button type="button" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow transition disabled:bg-blue-300 flex items-center gap-2" onClick={() => updateSemester(formData)}>
                {isPending ? "Updating..." : "Confirm & Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSemester;