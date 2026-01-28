import React, { useState } from "react";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";

// --- Interfaces ---

interface OldStudentResponse {
  enrolled: boolean;
  student: {
    firstname?: string;
    lastname?: string;
    middle_initial?: string;
    suffix?: string;
    sex?: string;
    department?: string;
    program?: string;
    year?: string;
    block?: string;
    // Matches your Laravel relationship structure
    profile?: {
      image_link: string;
    };
  };
}

interface CheckUserExistsResponse {
  exists: boolean;
  user?: any;
  message?: string;
}

const StudentManualRegister: React.FC = () => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"old" | "new" | "">("");
  const [file, setFile] = useState<File | null>(null);
  
  // 1. STATE: Store the existing image link from the database
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    middleInitial: "",
    suffix: "",
    sex: "",
    department: "",
    program: "",
    year: "",
    block: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Configs ---
  const departmentPrograms: Record<string, string[]> = {
    "College of Business Education": ["BSBA-MM", "BSBA-FM", "BSBA-OM", "BSEntrep"],
    "College of Teacher Education": ["BEEd", "BSed-English", "BSed-Mathematics"],
    "College of Computer Studies": ["BSIT", "ACT"],
  };

  const programYearMap: Record<string, number> = {
    "BSBA-MM": 4, "BSBA-FM": 4, "BSBA-OM": 4, BSEntrep: 4,
    BEEd: 4, "BSed-English": 4, "BSed-Mathematics": 4,
    BSIT: 4, ACT: 2,
  };

  const yearWords = ["First", "Second", "Third", "Fourth"];

  // --- Field Config ---
  const fields = [
    { label: "Student Number", name: "userId", required: true, as: "input", type: "text" },
    { label: "First Name", name: "firstName", required: true, as: "input", type: "text" },
    { label: "Middle Initial", name: "middleInitial", as: "input", type: "text" },
    { label: "Last Name", name: "lastName", required: true, as: "input", type: "text" },
    { label: "Suffix", name: "suffix", as: "input", type: "text" },
    {
      label: "Sex", name: "sex", required: true, as: "select",
      options: [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }],
      disabled: type === "old",
    },
    {
      label: "Department", name: "department", required: true, as: "select",
      options: [
        { value: "College of Business Education", label: "College of Business Education" },
        { value: "College of Teacher Education", label: "College of Teacher Education" },
        { value: "College of Computer Studies", label: "College of Computer Studies" },
      ],
    },
    {
      label: "Program", name: "program", required: true, as: "select",
      options: form.department ? departmentPrograms[form.department].map((v) => ({ value: v, label: v })) : [],
    },
    {
      label: "Year Level", name: "year", required: true, as: "select",
      options: form.program
        ? Array.from({ length: programYearMap[form.program] || 4 }).map((_, i) => ({
            value: `${yearWords[i]} Year`,
            label: `${yearWords[i]} Year`,
          }))
        : [],
    },
    {
      label: "Block", name: "block", required: true, as: "select",
      options: ["A", "B", "C"].map((sec) => ({ value: sec, label: sec })),
    },
  ];

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "department") setForm((prev) => ({ ...prev, program: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const fetchOldStudentData = async (): Promise<boolean> => {
    try {
      const res = await apiService.get<OldStudentResponse>(`/checkOldstudent/${form.userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.enrolled) {
        toast.error("This student is already enrolled for the active semester.");
        return false;
      }

      const data = res.data.student;

      // 2. LOGIC: Capture existing profile image if available
      if (data.profile?.image_link) {
        setExistingProfileImage(data.profile.image_link);
      } else {
        setExistingProfileImage(null);
      }

      setForm((prev) => ({
        ...prev,
        firstName: data.firstname || "",
        lastName: data.lastname || "",
        middleInitial: data.middle_initial || "",
        suffix: data.suffix || "",
        sex: data.sex || "",
        department: data.department || "",
        program: data.program || "",
        year: data.year || "",
        block: data.block || "",
      }));
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Student not found.");
      return false;
    }
  };

  const checkStudentRegistration = async (): Promise<boolean> => {
    try {
      const res = await apiService.get<CheckUserExistsResponse>(`/checkUserExists/${form.userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.exists) {
        toast.error("This student ID is already registered in the system.");
        return false;
      }
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) return true;
      toast.error(error?.response?.data?.message || "Error checking student ID.");
      return false;
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (file) formData.append("image", file);
    Object.entries(form).forEach(([key, value]) => {
      let backendKey = key;
      if (key === "userId") backendKey = "user_id";
      else if (key === "firstName") backendKey = "firstname";
      else if (key === "lastName") backendKey = "lastname";
      else if (key === "middleInitial") backendKey = "middle_initial";
      formData.append(backendKey, value);
    });

    try {
      await apiService.post("/StudentRegistration", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Student registered successfully!");
      setStep(1);
      setType("");
      setForm({
        userId: "", firstName: "", lastName: "", middleInitial: "", suffix: "",
        sex: "", department: "", program: "", year: "", block: "",
      });
      setFile(null);
      setExistingProfileImage(null); // Reset image state
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    }
  };

  // --- Helpers ---
  const Stepper = () => {
    const steps = ["Student Type", "Student Info", "Review"];
    return (
      <div className="flex justify-center mt-6 mb-8">
        <div className="flex items-center w-full max-w-2xl">
          {steps.map((label, index) => {
            const currentStep = index + 1;
            const isCompleted = step > currentStep;
            const isActive = step === currentStep;
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition ${isActive || isCompleted ? "bg-blue-600 text-white shadow" : "bg-gray-300 text-gray-500"}`}>
                    {currentStep}
                  </div>
                  <p className="mt-2 text-sm text-center whitespace-nowrap">{label}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition ${step > currentStep ? "bg-blue-600" : "bg-blue-300"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderField = (field: any) => {
    const commonProps = {
      name: field.name,
      value: form[field.name as keyof typeof form],
      onChange: handleChange,
      disabled: (field.disabled || (field.name === "program" && !form.department)) && !(type === "old" && field.name === "userId"),
      className: "w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
    };

    return (
      <div key={field.name}>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.as === "input" ? (
          <input type={field.type || "text"} {...commonProps} disabled={type === "old" && field.name !== "userId"} autoComplete="off" />
        ) : (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs crumbs={[{ label: "Students", to: "/students" }, { label: "Manual Registration" }]} />
      <Stepper />

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition ${type === "old" ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => { setType("old"); setForm(p => ({ ...p, userId: "" })); setExistingProfileImage(null); }}
                >
                  Old Student
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition ${type === "new" ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => { setType("new"); setForm(p => ({ ...p, userId: "" })); setExistingProfileImage(null); }}
                >
                  New Student
                </button>
              </div>
              {type === "old" && <div className="border-l border-gray-300 h-auto"></div>}
              {type === "old" && <div className="flex-1">{renderField(fields[0])}</div>}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                onClick={async () => {
                  if (!type) return toast.error("Please select a student type.");
                  if (type === "old") {
                    if (!form.userId.trim()) return toast.error("Please enter a student ID.");
                    setIsLoading(true);
                    const ok = await fetchOldStudentData();
                    setIsLoading(false);
                    if (!ok) return;
                  }
                  setStep(2);
                }}
              >
                {isLoading ? "Loading..." : "Next"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-4 py-3"><h4 className="font-semibold text-white">Personal Information</h4></div>
                <div className="p-4">
                  <div className="flex flex-col items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    <label htmlFor="profileImage" className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition bg-gray-50 overflow-hidden">
                      {/* IMAGE PRIORITY LOGIC */}
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : existingProfileImage ? (
                        <img src={existingProfileImage} alt="Existing" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center"><p className="text-xs text-gray-500">Click or drag images</p></div>
                      )}
                      <input id="profileImage" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {file && <div className="flex items-center gap-2"><span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span><button type="button" className="text-red-500 hover:text-red-700 text-xs font-medium" onClick={() => setFile(null)}>Remove</button></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">{fields.slice(0, 6).map(renderField)}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-4 py-3"><h4 className="font-semibold text-white">Academic Information</h4></div>
                <div className="p-4"><div className="grid grid-cols-1 gap-4">{fields.slice(6).map(renderField)}</div></div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md transition" onClick={() => setStep(1)}>Back</button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md transition disabled:bg-blue-300"
                disabled={isLoading}
                onClick={async () => {
                  for (const f of fields) { if (f.required && !form[f.name as keyof typeof form]) return toast.error(`Please fill ${f.label}`); }
                  if (type === "new") {
                    setIsLoading(true);
                    const isAvailable = await checkStudentRegistration();
                    setIsLoading(false);
                    if (!isAvailable) return;
                  }
                  setStep(3);
                }}
              >
                {isLoading ? "Loading..." : "Next"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-4 py-3"><h4 className="font-semibold text-white">Personal Information</h4></div>
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="w-24 h-24 rounded-full border-2 border-blue-300 overflow-hidden flex items-center justify-center bg-white shadow-sm mx-auto mb-2">
                        {/* IMAGE PRIORITY LOGIC */}
                        {file ? (
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        ) : existingProfileImage ? (
                          <img src={existingProfileImage} alt="Existing" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-blue-400">
                             <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="text-center"><span className="text-xs font-medium text-gray-500 block">Student ID</span><span className="text-sm font-bold text-gray-600">{form.userId}</span></div>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-3">
                        {fields.slice(1, 6).map(f => (
                          <div key={f.name}><span className="text-xs font-medium text-gray-500 block">{f.label}</span><span className="text-sm text-gray-800 font-medium">{form[f.name as keyof typeof form] || "N/A"}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-4 py-3"><h4 className="font-semibold text-white">Academic Information</h4></div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {fields.slice(6).map(f => (
                      <div key={f.name}><span className="text-xs font-medium text-gray-500 block">{f.label}</span><span className="text-sm text-gray-800 font-medium">{form[f.name as keyof typeof form] || "N/A"}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 text-sm rounded-md transition" onClick={() => setStep(2)}>Back</button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md transition disabled:bg-blue-300"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  await handleSubmit();
                  setIsSubmitting(false);
                }}
              >
                {isSubmitting ? "Processing..." : "Confirm & Register Student"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManualRegister;