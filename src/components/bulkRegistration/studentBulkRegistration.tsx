import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import FileUploader from "../fileUploaders/studentFileUploader";
import ImportTabs from "../tabs/studentbulkRegistrationTabs";
import apiService from "../../services/ApiService";
// 1. Import useQueryClient
import { useQueryClient } from "@tanstack/react-query"; 

// --- Interfaces ---
interface StudentData {
  id: string;
  firstname: string;
  middle_initial: string;
  lastname: string;
  suffix?: string;
  sex: string;
  program: string;    
  year_level: string; 
  block: string;      
  [key: string]: any;
}

interface ImportUsersApiData {
  to_enroll: StudentData[];
  already_enrolled: StudentData[];
}

interface ImportUsersResponse {
  data: ImportUsersApiData;
  message?: string;
  error?: string;
}

interface StoreBulkUsersResponse {
  message?: string;
  inserted?: number;
  total_received?: number;
  errors?: string[];
}

const StudentBulkRegistration: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 2. Initialize Query Client
  const queryClient = useQueryClient();

  const [importedData, setImportedData] = useState<ImportUsersApiData>({
    to_enroll: [],
    already_enrolled: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<"to_enroll" | "already_enrolled">("to_enroll");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validExtensions = ["xlsx", "xls", "csv"];
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      
      if (!extension || !validExtensions.includes(extension)) {
        toast.error("Invalid file type. Only .xlsx, .xls, or .csv files are allowed.");
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
      const response = await apiService.post<ImportUsersResponse>(
        "/importStudent",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
      const message = error.response?.data?.error || error.response?.data?.message || "Upload failed.";
      if (typeof message === 'string' && message.includes("Invalid file format")) {
         toast.error(message, { duration: 5000 });
      } else {
         toast.error(message);
      }
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
      const response = await apiService.post<StoreBulkUsersResponse>(
        "/storeBulkStudent",
        { users: usersToEnroll }
      );

      const inserted = response.data.inserted || 0;
      const total = response.data.total_received || 0;

      if (inserted > 0) {
        toast.success(`Successfully enrolled ${inserted} out of ${total} students!`);
        
        // 3. Invalidate the students query
        // This forces the "Student List" page to re-fetch data next time it is viewed.
        await queryClient.invalidateQueries({ queryKey: ["students"] });

        setImportedData({ to_enroll: [], already_enrolled: [] });
      } else {
        toast.success("Process complete, but no new students were enrolled (duplicates skipped).");
      }

      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(`Some rows failed: \n${response.data.errors.slice(0, 3).join('\n')}...`);
      }

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
        containerClassName="mt-10 text-lg"
        toastOptions={{
          success: { style: { background: "#f0fdf4", color: "#166534" } },
          error: { style: { background: "#fef2f2", color: "#991b1b" } },
          style: { maxWidth: "500px", whiteSpace: "pre-wrap", wordWrap: "break-word" },
        }}
      />
      
      <Breadcrumbs
        crumbs={[
          { label: "Students", to: "/students" },
          { label: "Bulk Registration" },
        ]}
      />

      {/* File uploader */}
      <div className="bg-white rounded-lg shadow p-4 mb-3">
        <FileUploader
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>

      {/* Table Tabs */}
      {(importedData.to_enroll.length > 0 || importedData.already_enrolled.length > 0) && (
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

export default StudentBulkRegistration;