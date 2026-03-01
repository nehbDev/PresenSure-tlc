import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import FileUploader from "../fileUploaders/instructorFileUploader";
import ImportTabs from "../tabs/instructorbulkRegistrationTabs";
import apiService from "../../services/ApiService";

// Define TypeScript types for API response
interface InstructorsImportData {
  to_register: Array<{
    user_id: string;
    firstname: string;
    middle_initial: string;
    lastname: string;
    sex: string;
    department?: string;
    specialization?: string;
    [key: string]: any;
  }>;
  already_registered: any[];
}
interface InstructorsImportResponse {
  message?: string;
  data?: InstructorsImportData;
  error?: string;
}
interface BulkStoreResponse {
  message?: string;
  error?: string;
}

const BulkInstructorRegistration: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [importedData, setImportedData] = useState<InstructorsImportData>({
    to_register: [],
    already_registered: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<
    "to_register" | "already_registered"
  >("to_register");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]; // Fix: use first File object
      const validExtensions = ["xlsx", "xls", "csv"];
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        toast.error("Invalid file type. Only .xlsx, .xls, or .csv allowed.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      // Use generics for correct typing
      const response = await apiService.post<InstructorsImportResponse>(
        "/importInstructors",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.data) {
        toast.success(response.data.message || "Upload successful!");
        setImportedData({
          to_register: response.data.data.to_register || [],
          already_registered: response.data.data.already_registered || [],
        });
        setSelectedCategory("to_register");
      } else {
        toast.error("Unexpected response structure.");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Upload failed.";
      toast.error(message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleSaveToDatabase = async () => {
    const instructors = importedData.to_register || [];
    if (instructors.length === 0) {
      toast.error("No instructors to register.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiService.post<BulkStoreResponse>(
        "/storeBulkInstructors",
        { users: instructors }
      );
      toast.success(response.data.message || "Instructors saved successfully!");
      setImportedData({
        to_register: [],
        already_registered: [],
      });
      setSelectedCategory("to_register");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to save instructors.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toaster
        position="top-center"
        containerClassName="mt-10 text-lg" // Adjust margin-top as needed
        toastOptions={{
          success: {
            style: {
              background: "#f0fdf4",
              color: "#166534",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
            },
          },
          style: {
            maxWidth: "400px",
            minWidth: "300px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          },
        }}
      />
      <Breadcrumbs
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Instructors", to: "/instructors" },
          { label: "Bulk Registration" },
        ]}
      />
      <div className="bg-white p-4 rounded-lg shadow-md">
        <FileUploader
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>
      {(importedData.to_register.length > 0 ||
        importedData.already_registered.length > 0) && (
        <ImportTabs
          data={importedData}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          onSave={handleSaveToDatabase}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default BulkInstructorRegistration;
