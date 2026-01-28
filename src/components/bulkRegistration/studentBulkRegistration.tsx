import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import FileUploader from "../fileUploaders/studentFileUploader";
import ImportTabs from "../tabs/studentbulkRegistrationTabs";
import apiService from "../../services/ApiService";

// 1. Define response types
interface ImportUsersApiData {
  to_enroll: Array<{
    id: string;
    firstname: string;
    middle_initial: string;
    lastname: string;
    suffix?: string;
    sex: string;
    course?: string;
    year_level?: string;
    section?: string;
    [key: string]: any;
  }>;
  already_enrolled: any[];
}
interface ImportUsersResponse {
  data: ImportUsersApiData;
  message?: string;
  error?: string;
}
interface StoreBulkUsersResponse {
  message?: string;
  error?: string;
}

const studentBulkRegistration: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importedData, setImportedData] = useState<ImportUsersApiData>({
    to_enroll: [],
    already_enrolled: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<
    "to_enroll" | "already_enrolled"
  >("to_enroll");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validExtensions = ["xlsx", "xls", "csv"];
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        toast.error(
          "Invalid file type. Only .xlsx, .xls, or .csv files are allowed."
        );
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
      // 2. Use generics for the correct API response
      const response = await apiService.post<ImportUsersResponse>(
        "/importStudent",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data && response.data.data) {
        toast.success(response.data.message || "Upload successful!");
        setImportedData({
          to_enroll: response.data.data.to_enroll || [],
          already_enrolled: response.data.data.already_enrolled || [],
        });
        setSelectedCategory("to_enroll");
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
    const usersToEnroll = importedData.to_enroll || [];
    if (usersToEnroll.length === 0) {
      toast.error("No users to enroll.");
      return;
    }

    try {
      setIsSaving(true);

      // Debug: Log what's being sent
      console.log("Sending users:", usersToEnroll);

      const response = await apiService.post<StoreBulkUsersResponse>(
        "/storeBulkStudent",
        {
          users: usersToEnroll,
        }
      );

      console.log("Response:", response);
      toast.success(response.data.message || "Users saved successfully!");
      setImportedData({ to_enroll: [], already_enrolled: [] });
      setSelectedCategory("to_enroll");
    } catch (error: any) {
      console.error("Save error:", error);
      const message = error.response?.data?.message || "Failed to save users.";
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
          { label: "Students", to: "/students" },
          { label: "Bulk Registration" },
        ]}
      />

      {/* File uploader and template */}
      <div className="bg-white rounded-lg shadow p-4 mb-3">
        <FileUploader
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>

      {(importedData.to_enroll.length > 0 ||
        importedData.already_enrolled.length > 0) && (
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

export default studentBulkRegistration;
