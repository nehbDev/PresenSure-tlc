import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import FileUploader from "../fileUploaders/scheduleFileIUploader";
import ImportTabs from "../tabs/scheduleBulkTabs";
import apiService from "../../services/ApiService";

const BulkSchedule: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importedData, setImportedData] = useState({
    to_import: [] as any[],
    already_imported: [] as any[],
    invalid: [] as any[],
  });
  const [selectedCategory, setSelectedCategory] = useState<
    "to_import" | "already_imported"
  >("to_import");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const res = await apiService.post("/importSchedules", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Fix: Assert the type of the response
      setImportedData((res.data as { data: typeof importedData }).data);
      setSelectedCategory("to_import");
      toast.success("File processed successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleSaveToDatabase = async () => {
    if (importedData.to_import.length === 0) {
      toast.error("No schedules to save");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiService.post("/storeBulkSchedules", {
        schedules: importedData.to_import,
      });
      // Fix: Assert the type of the response
      toast.success((res.data as { message: string }).message);
      setImportedData({
        to_import: [],
        already_imported: [],
        invalid: [],
      });
      setSelectedCategory("to_import");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
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
          { label: "Schedules", to: "/schedules" },
          { label: "Bulk Import" },
        ]}
      />
      <div className="flex-1 w-full bg-white p-4 rounded-lg shadow-md m-0">
        <FileUploader
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>
      {(importedData.to_import.length > 0 ||
        importedData.already_imported.length > 0 ||
        importedData.invalid.length > 0) && (
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

export default BulkSchedule;
