import React, { useState } from "react";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import { toast, Toaster } from "react-hot-toast";

interface RegisterInstructorResponse {
  message?: string;
  user?: any;
  profile?: any;
  instructor?: any;
}

const InstructorManualRegister: React.FC = () => {
  const [form, setForm] = useState({
    user_id: "",
    firstname: "",
    lastname: "",
    middle_initial: "",
    sex: "",
    department: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // --- 1. Instructor ID Formatting Logic ---
    if (name === "user_id") {
      // Remove non-numeric characters
      const numbersOnly = value.replace(/[^0-9]/g, "");
      
      // Limit to 8 digits max (to allow formats 0000-000 or 0000-0000)
      const truncated = numbersOnly.slice(0, 8);

      let formattedId = "";
      if (truncated.length > 0) {
        formattedId = truncated.substring(0, 4);
        if (truncated.length > 4) {
          formattedId += "-" + truncated.substring(4);
        }
      }

      setForm((prev) => ({ ...prev, [name]: formattedId }));
      return;
    }

    // --- 2. Middle Initial Formatting (Force Uppercase & Limit) ---
    if (name === "middle_initial") {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase().slice(0, 1) }));
      return;
    }

    // --- 3. Standard Handling ---
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = [
      { name: "user_id", label: "Instructor ID" },
      { name: "firstname", label: "First Name" },
      { name: "lastname", label: "Last Name" },
      { name: "sex", label: "Sex" },
      { name: "department", label: "Department" },
    ];

    for (const field of requiredFields) {
      if (!form[field.name as keyof typeof form]) {
        toast.error(`Please fill ${field.label}`);
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (file) formData.append("image", file);

      const res = await apiService.post<RegisterInstructorResponse>(
        "registerInstructor",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message || "Instructor registered successfully!");

      // reset form
      setForm({
        user_id: "",
        firstname: "",
        lastname: "",
        middle_initial: "",
        sex: "",
        department: "",
      });
      setFile(null);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Instructors", to: "/instructors" },
          { label: "Manual Registration" },
        ]}
      />

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Organized Input Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-4 py-3">
                <h4 className="font-semibold text-white">
                  Personal Information
                </h4>
              </div>
              <div className="p-4">
                <div className="flex flex-col items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  {/* Upload area */}
                  <label
                    htmlFor="profileImage"
                    className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition bg-gray-50 overflow-hidden"
                  >
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-gray-500">
                          Click or drag images
                        </p>
                      </div>
                    )}
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* File name + remove option */}
                  {file && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Instructor ID */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Instructor ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="user_id"
                      value={form.user_id}
                      onChange={handleChange}
                      maxLength={9} // 4 digits + 1 dash + 4 digits
                      placeholder="0000-0000"
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      First Name <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-400 ml-1 font-normal">(Max 12)</span>
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={form.firstname}
                      onChange={handleChange}
                      maxLength={12}
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>

                  {/* Middle Initial */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Middle Initial
                      <span className="text-xs text-gray-400 ml-1 font-normal">(Max 1)</span>
                    </label>
                    <input
                      type="text"
                      name="middle_initial"
                      value={form.middle_initial}
                      onChange={handleChange}
                      maxLength={1}
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Last Name <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-400 ml-1 font-normal">(Max 12)</span>
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={form.lastname}
                      onChange={handleChange}
                      maxLength={12}
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>

                  {/* Sex */}
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Sex <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sex"
                      value={form.sex}
                      onChange={handleChange}
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-auto">
              <div className="bg-blue-600 px-4 py-3">
                <h4 className="font-semibold text-white">
                  Professional Information
                </h4>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    >
                      <option value="">Select Department</option>
                      <option value="College of Computer Studies">
                        College of Computer Studies
                      </option>
                      <option value="College of Business Education">
                        College of Business Education
                      </option>
                      <option value="College of Teacher Education">
                        College of Teacher Education
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register Instructor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorManualRegister;