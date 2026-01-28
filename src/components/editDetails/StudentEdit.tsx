import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";
import StudentEditSkeleton from "../../components/contentLoader/StudentEditSkeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // 1. Import useQueryClient

// --- Interfaces ---
interface StudentDetailsResponse {
  data: {
    user_id: string;
    firstname: string;
    lastname: string;
    middle_initial: string | null;
    suffix: string | null;
    sex: string;
    program: string;
    year_level: string;
    block: string;
    profile: {
      image_link: string;
    } | null;
  };
}

const StudentEdit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  
  // 2. Initialize Query Client
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: "",
    firstname: "", // Fixed key case to match API often used in form state
    lastname: "",
    middleInitial: "",
    suffix: "",
    sex: "",
    password: "",
    department: "",
    program: "",
    year: "",
    block: "",
  });

  // --- Configs ---
  const departmentPrograms: Record<string, string[]> = {
    "College of Business Education": ["BSBA-MM", "BSBA-FM", "BSBA-OM", "BSEntrep"],
    "College of Teacher Education": ["BEEd", "BSed-English", "BSed-Mathematics"],
    "College of Computer Studies": ["BSIT", "ACT"],
  };

  const programYearMap: Record<string, number> = {
    "BSBA-MM": 4, "BSBA-FM": 4, "BSBA-OM": 4, "BSEntrep": 4,
    "BEEd": 4, "BSed-English": 4, "BSed-Mathematics": 4,
    "BSIT": 4, "ACT": 2,
  };

  const yearWords = ["First", "Second", "Third", "Fourth"];

  // --- 1. QUERY LOGIC ---
  const {
    data: studentData,
    isLoading,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const response = await apiService.get<StudentDetailsResponse>(
        `/studentDetails?id=${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
  });

  // --- 2. SYNC LOGIC ---
  useEffect(() => {
    if (studentData) {
      setExistingProfileImage(null);
      setFile(null);

      const cleanProgram = studentData.program ? studentData.program.trim() : "";
      let foundDept = "";
      
      Object.entries(departmentPrograms).forEach(([deptKey, programs]) => {
        if (programs.includes(cleanProgram)) {
          foundDept = deptKey;
        }
      });

      setForm({
        userId: studentData.user_id || "",
        firstname: studentData.firstname || "",
        lastname: studentData.lastname || "",
        middleInitial: studentData.middle_initial || "",
        suffix: studentData.suffix || "",
        sex: studentData.sex || "",
        password: "",
        department: foundDept,
        program: cleanProgram,
        year: studentData.year_level || "", 
        block: studentData.block || "",
      });

      if (studentData.profile && studentData.profile.image_link) {
        setExistingProfileImage(studentData.profile.image_link);
      }
    }
  }, [studentData]); 

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "department") {
        setForm((prev) => ({ ...prev, program: "", year: "" })); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if(!form.userId || !form.firstname || !form.lastname || !form.program) {
        toast.error("Please fill in all required fields.");
        return;
    }

    // Ensure keys match what backend expects (check your controller validation)
    formData.append("user_id", form.userId);
    formData.append("firstname", form.firstname);
    formData.append("lastname", form.lastname);
    formData.append("middle_initial", form.middleInitial);
    formData.append("suffix", form.suffix);
    formData.append("sex", form.sex);
    formData.append("program", form.program);
    formData.append("year", form.year);
    formData.append("block", form.block);

    if (form.password) {
      formData.append("password", form.password);
    }

    if (file) {
      formData.append("image", file);
    }

    try {
      setIsSubmitting(true);
      await apiService.post("/updateStudent", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Student updated successfully!");

      // 3. THE FIX: Invalidate queries to force re-fetch
      // This wipes the "student" cache for this specific ID
      await queryClient.invalidateQueries({ queryKey: ["student", id] });
      // Also wipe the main list so the table updates
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      setTimeout(() => {
        navigate(`/students/student-details?id=${form.userId}`);
      }, 500); // Reduced delay for snappier feel
    } catch (error: any) {
      console.error("Update error", error);
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { label: "Student Number", name: "userId", required: true, as: "input", type: "text", disabled: true },
    { label: "First Name", name: "firstname", required: true, as: "input", type: "text" },
    { label: "Middle Initial", name: "middleInitial", as: "input", type: "text" },
    { label: "Last Name", name: "lastname", required: true, as: "input", type: "text" },
    { label: "Suffix", name: "suffix", as: "input", type: "text" },
    {
      label: "Sex", name: "sex", required: true, as: "select",
      options: [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }],
    },
    { 
      label: "Password", 
      name: "password", 
      required: false, 
      as: "input", 
      type: "password", 
      placeholder: "Leave blank to keep current password" 
    },
    {
      label: "Department", name: "department", required: true, as: "select",
      options: Object.keys(departmentPrograms).map(dept => ({ value: dept, label: dept })),
    },
    {
      label: "Program", name: "program", required: true, as: "select",
      options: form.department 
        ? departmentPrograms[form.department]?.map((v) => ({ value: v, label: v })) || []
        : [],
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

  const renderField = (field: any) => {
    const commonProps = {
      name: field.name,
      value: form[field.name as keyof typeof form] || "",
      onChange: handleChange,
      disabled: field.disabled || (field.name === "program" && !form.department),
      placeholder: field.placeholder,
      className: "w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500",
    };

    return (
      <div key={field.name}>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.as === "input" ? (
          <input type={field.type || "text"} {...commonProps} autoComplete="new-password" />
        ) : (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs
        crumbs={[
          { label: "Students", to: "/students" },
          { label: "Student Details", to: `/students/student-details?id=${id}` },
          { label: "Edit Student" },
        ]}
      />

      {isLoading ? (
        <StudentEditSkeleton />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                <h4 className="font-semibold text-white">Personal Information</h4>
              </div>
              <div className="flex flex-col items-center gap-4 border-b border-gray-200 pb-6">
                <label
                  htmlFor="profileImage"
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition bg-gray-50 overflow-hidden relative group"
                >
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : existingProfileImage ? (
                    <img src={existingProfileImage} alt="Existing" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                  <input id="profileImage" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {file && (
                  <button type="button" className="text-red-500 text-xs hover:underline" onClick={() => setFile(null)}>
                    Revert to original
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.slice(0, 7).map(renderField)}
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                <h4 className="font-semibold text-white">Academic Information</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {fields.slice(7).map(renderField)}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Editing academic information will update the record for the <strong>Active Semester only</strong>.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEdit;