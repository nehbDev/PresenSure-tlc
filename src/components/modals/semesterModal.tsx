import React, { useState } from "react";
import apiService from "../../services/ApiService";

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
}

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
}> = ({ label, value, min, max, onChange }) => (
  <div className="mb-2">
    <label className="block text-xs">{label}</label>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1 w-full"
      required
    />
  </div>
);

const SemesterModal: React.FC<SemesterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const currentYear = new Date().getFullYear();
  // From last year to +4 years
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - 1 + i).toString()
  );

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

  const validateStep1 = () =>
    !!(
      formData.description &&
      formData.schoolyear_start &&
      formData.schoolyear_end &&
      formData.semester_start &&
      formData.semester_end
    );

  const validateStep2 = (): { valid: boolean; message?: string } => {
    const sStart = new Date(formData.semester_start);
    const sEnd = new Date(formData.semester_end);

    for (const p of formData.periods) {
      if (!(p.start_date && p.end_date))
        return {
          valid: false,
          message: `All periods must have start and end dates.`,
        };
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      if (start < sStart || end > sEnd)
        return {
          valid: false,
          message: `Period ${p.name} dates must be within semester dates.`,
        };
      if (end < start)
        return {
          valid: false,
          message: `Period ${p.name} end date cannot precede its start date.`,
        };
    }

    for (let i = 1; i < formData.periods.length; i++) {
      const prev = formData.periods[i - 1];
      const curr = formData.periods[i];
      if (new Date(curr.start_date) <= new Date(prev.end_date))
        return {
          valid: false,
          message: `${curr.name} overlaps or is out of order.`,
        };
      if (
        periodNamesOrder.indexOf(curr.name) !==
        periodNamesOrder.indexOf(prev.name) + 1
      )
        return { valid: false, message: `Periods must be in correct order.` };
    }

    return { valid: true };
  };

  const addNextPeriod = () => {
    if (formData.periods.length === periodNamesOrder.length) return;

    const lastPeriod = formData.periods[formData.periods.length - 1];
    if (lastPeriod && (!lastPeriod.start_date || !lastPeriod.end_date)) {
      alert("Please complete the current period before adding a new one.");
      return;
    }

    const nextName = periodNamesOrder[formData.periods.length];
    setFormData((f) => ({
      ...f,
      periods: [...f.periods, { name: nextName, start_date: "", end_date: "" }],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      alert("Please complete semester details.");
      return;
    }
    if (step === 2) {
      const { valid, message } = validateStep2();
      if (!valid) {
        alert(message);
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      type SemesterResponse = {
        id: number;
        description: string;
        status: string;
        schoolyear_start: string;
        schoolyear_end: string;
        semester_start: string;
        semester_end: string;
        periods: {
          id: number;
          semester_id: number;
          name: string;
          start_date: string;
          end_date: string;
        }[];
      };
      const res = await apiService.post<ApiResponse<SemesterResponse>>(
        "/semesters",
        {
          ...formData,
          status: "inactive",
        }
      );
      alert("Semester and Periods created successfully.");
      onSave(res.data.data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving semester.");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded p-6 max-w-lg w-full max-h-[90vh] overflow-auto text-black">
        <h2 className="text-lg font-semibold mb-4">
          Add Semester - Step {step} of 3
        </h2>

        {/* STEP 1: Semester Info */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium">Description</label>
              <select
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  School Year Start
                </label>
                <select
                  name="schoolyear_start"
                  value={formData.schoolyear_start}
                  onChange={(e) => {
                    const startYear = e.target.value;
                    const endYear = startYear
                      ? (parseInt(startYear) + 1).toString()
                      : "";
                    setFormData((f) => ({
                      ...f,
                      schoolyear_start: startYear,
                      schoolyear_end: endYear,
                    }));
                  }}
                  className="w-full border rounded px-3 py-2"
                  required
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
                <label className="block text-sm font-medium">
                  School Year End
                </label>
                <input
                  value={formData.schoolyear_end}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            <DateInput
              label="Semester Start"
              value={formData.semester_start}
              min={`${formData.schoolyear_start}-01-01`}
              max={`${formData.schoolyear_end}-12-31`}
              onChange={(val) =>
                setFormData((f) => ({ ...f, semester_start: val }))
              }
            />

            <DateInput
              label="Semester End"
              value={formData.semester_end}
              min={
                formData.semester_start || `${formData.schoolyear_start}-01-01`
              }
              max={`${formData.schoolyear_end}-12-31`}
              onChange={(val) =>
                setFormData((f) => ({ ...f, semester_end: val }))
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Periods */}
        {step === 2 && (
          <>
            <h3 className="font-semibold mb-3">
              Add Periods (Prelim to Finals)
            </h3>
            <div className="max-h-[60vh] overflow-auto pr-2 space-y-4">
              {formData.periods.map(({ name, start_date, end_date }) => (
                <div key={name} className="border rounded p-4">
                  <h4 className="font-medium mb-2">{name}</h4>
                  <DateInput
                    label={`${name} Start`}
                    value={start_date}
                    min={formData.semester_start}
                    max={formData.semester_end}
                    onChange={(val) =>
                      setFormData((f) => ({
                        ...f,
                        periods: f.periods.map((p) =>
                          p.name === name ? { ...p, start_date: val } : p
                        ),
                      }))
                    }
                  />
                  <DateInput
                    label={`${name} End`}
                    value={end_date}
                    min={start_date || formData.semester_start}
                    max={formData.semester_end}
                    onChange={(val) =>
                      setFormData((f) => ({
                        ...f,
                        periods: f.periods.map((p) =>
                          p.name === name ? { ...p, end_date: val } : p
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4 space-x-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>

              <button
                type="button"
                onClick={addNextPeriod}
                disabled={
                  formData.periods.length === periodNamesOrder.length ||
                  (formData.periods.length > 0 &&
                    (!formData.periods.at(-1)?.start_date ||
                      !formData.periods.at(-1)?.end_date))
                }
                className={`px-4 py-2 rounded ${
                  formData.periods.length === periodNamesOrder.length ||
                  (formData.periods.length > 0 &&
                    (!formData.periods.at(-1)?.start_date ||
                      !formData.periods.at(-1)?.end_date))
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Add Period
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={formData.periods.length === 0}
                className={`px-4 py-2 rounded ${
                  formData.periods.length === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-green-700 text-white hover:bg-green-800"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <>
            <h3 className="font-semibold mb-3">Review and Confirm</h3>
            <div className="max-h-[60vh] overflow-auto space-y-4">
              <div>
                <strong>Description:</strong> {formData.description}
              </div>
              <div>
                <strong>School Year:</strong> {formData.schoolyear_start} -{" "}
                {formData.schoolyear_end}
              </div>
              <div>
                <strong>Semester Dates:</strong> {formData.semester_start} to{" "}
                {formData.semester_end}
              </div>
              <div>
                <h4 className="font-medium mt-3 mb-1">Periods</h4>
                <ul className="list-disc pl-6">
                  {formData.periods.map((p) => (
                    <li key={p.name}>
                      {p.name}: {p.start_date} to {p.end_date}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-4 space-x-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Confirm and Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SemesterModal;
