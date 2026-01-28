import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";
import StudentEditSkeleton from "../../components/contentLoader/StudentEditSkeleton"; 
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- Interfaces ---
interface InstructorDetailsResponse {
  data: {
    user_id: string;
    firstname: string;
    lastname: string;
    middle_initial: string | null;
    suffix: string | null;
    sex: string;
    department: string;
    status: string;
    profile: {
      image_link: string;
    } | null;
  };
}

const InstructorEdit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);

  // Form State - Matches the UI inputs
  const [form, setForm] = useState({
    userId: "",
    firstname: "",
    lastname: "",
    middleInitial: "", // CamelCase for internal state
    suffix: "",
    sex: "",
    department: "",
    status: "",
    password: "", 
  });

  // Options
  const departments = [
    "College of Computer Studies",
    "College of Business Education",
    "College of Teacher Education",
  ];


  // --- 1. QUERY LOGIC ---
  const {
    data: instructorData,
    isLoading,
  } = useQuery({
    queryKey: ["instructor", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const response = await apiService.get<InstructorDetailsResponse>(
        `/getInstructorDetails?id=${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // --- 2. SYNC DATA TO FORM ---
  useEffect(() => {
    if (instructorData) {
      setExistingProfileImage(null);
      setFile(null);

      // Map Backend (snake_case) to Frontend (camelCase)
      setForm({
        userId: instructorData.user_id || "",
        firstname: instructorData.firstname || "",
        lastname: instructorData.lastname || "",
        middleInitial: instructorData.middle_initial || "", // Mapped here
        suffix: instructorData.suffix || "",
        sex: instructorData.sex || "",
        department: instructorData.department || "",
        status: instructorData.status || "ACTIVE",
        password: "",
      });

      if (instructorData.profile && instructorData.profile.image_link) {
        setExistingProfileImage(instructorData.profile.image_link);
      }
    }
  }, [instructorData]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    // Basic frontend validation
    if (!form.userId || !form.firstname || !form.lastname || !form.department) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Map Frontend (camelCase) to Backend (snake_case) for FormData
    const formData = new FormData();
    formData.append("user_id", form.userId);
    formData.append("firstname", form.firstname);
    formData.append("lastname", form.lastname);
    
    // Handle optional fields
    if (form.middleInitial) formData.append("middle_initial", form.middleInitial); // Crucial mapping
    if (form.suffix) formData.append("suffix", form.suffix);
    
    formData.append("sex", form.sex);
    formData.append("department", form.department);
    formData.append("status", form.status);

    if (form.password) {
      formData.append("password", form.password);
    }

    if (file) {
      formData.append("image", file);
    }

    try {
      setIsSubmitting(true);
      
      // Send to Backend
      await apiService.post("/updateInstructor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Instructor updated successfully!");

      // Invalidate queries to refresh data across the app
      await queryClient.invalidateQueries({ queryKey: ["instructor", id] });
      await queryClient.invalidateQueries({ queryKey: ["instructors"] });

      // Navigate back to details after brief delay
      setTimeout(() => {
        navigate(`/instructors/instructor-details?id=${form.userId}`);
      }, 500);
    } catch (error: any) {
      console.error("Update error", error);
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render inputs
  const renderInput = (label: string, name: keyof typeof form, required = false, type = "text", disabled = false, placeholder = "") => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );

  const renderSelect = (label: string, name: keyof typeof form, options: { value: string; label: string }[], required = false) => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs
        crumbs={[
          { label: "Instructors", to: "/instructors" },
          { label: "Instructor Details", to: `/instructors/instructor-details?id=${id}` },
          { label: "Edit Instructor" },
        ]}
      />

      {isLoading ? (
        <StudentEditSkeleton />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- Personal Information Column --- */}
            <div className="flex-1 space-y-6">
              <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                <h4 className="font-semibold text-white">Personal Information</h4>
              </div>

              {/* Image Uploader */}
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

              {/* Personal Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderInput("Instructor ID", "userId", true, "text", true)}
                {renderInput("First Name", "firstname", true)}
                {renderInput("Middle Initial", "middleInitial")}
                {renderInput("Last Name", "lastname", true)}
                {renderInput("Suffix", "suffix")}
                {renderSelect(
                  "Sex",
                  "sex",
                  [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }],
                  true
                )}
              </div>
            </div>

            {/* --- Professional Information Column --- */}
            <div className="flex-1 space-y-6">
              <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                <h4 className="font-semibold text-white">Professional Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {renderSelect(
                  "Department",
                  "department",
                  departments.map(d => ({ value: d, label: d })),
                  true
                )}



                <div className="pt-4 border-t border-gray-100 mt-2">
                   {renderInput("Password", "password", false, "password", false, "Leave blank to keep current password")}
                </div>
              </div>
            </div>
          </div>

          {/* --- Footer Actions --- */}
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

export default InstructorEdit;