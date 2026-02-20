import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FaCloudUploadAlt, FaSpinner } from "react-icons/fa"; 
// 1. Import createPortal
import { createPortal } from "react-dom";
import apiService from "../../services/ApiService";
import Breadcrumbs from "../../layout/Breadcrumbs";
import UploadResultsModal, { type BulkUploadResponse } from "../modals/UploadResultsModal";

const BulkImageUpload: React.FC = () => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const pageType: "student" | "instructor" = location.pathname.includes("/students")
    ? "student"
    : "instructor";

  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<BulkUploadResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const crumbs = [
    {
      label: pageType === "student" ? "Students" : "Instructors",
      to: `/${pageType}s`,
    },
    { label: "Bulk Image Upload" },
  ];

  useEffect(() => {
    setFiles(null);
    setPreviews([]);
    setUploadResults(null);
    setShowModal(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer?.files) {
        handleFiles(e.dataTransfer.files);
      }
    };
    const drop = dropRef.current;
    if (drop) {
      drop.addEventListener("dragover", onDragOver);
      drop.addEventListener("dragleave", onDragLeave);
      drop.addEventListener("drop", onDrop);
    }
    return () => {
      if (drop) {
        drop.removeEventListener("dragover", onDragOver);
        drop.removeEventListener("dragleave", onDragLeave);
        drop.removeEventListener("drop", onDrop);
      }
    };
  }, [dropRef.current]);

  function filesArrayToFileList(filesArray: File[]): FileList {
    const dataTransfer = new DataTransfer();
    filesArray.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

  const handleFiles = (selectedFiles: FileList | File[]) => {
    if (!selectedFiles || (selectedFiles instanceof FileList && selectedFiles.length === 0)) {
      toast.error("Please select image files.");
      return;
    }
    const validExtensions = ["jpg", "jpeg", "png", "webp"];
    for (const file of Array.from(selectedFiles)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        toast.error(`Invalid file: ${file.name}`);
        return;
      }
    }
    const newFileList = filesArrayToFileList(Array.from(selectedFiles));
    setFiles(newFileList);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!files) {
      setPreviews([]);
      return;
    }
    const imagePreviews = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews(imagePreviews);
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const removeImageAtIndex = (indexToRemove: number) => {
    if (!files) return;
    const fileArray = Array.from(files);
    fileArray.splice(indexToRemove, 1);
    const newFileList = filesArrayToFileList(fileArray);
    setFiles(newFileList);
  };

  const handleBulkUpload = async () => {
    if (!files || files.length === 0) {
      toast.error("No files selected.");
      return;
    }

    setIsUploading(true);
    
    const BATCH_SIZE = 20; 
    const allFiles = Array.from(files);
    const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);
    
    let accumulatedResults: BulkUploadResponse = {
        success: [],
        skipped: [],
        failed: { invalid_format: [], user_not_found: [], profile_exists: [], upload_failed: [] }
    };

    try {
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const batchFiles = allFiles.slice(start, end);

        const formData = new FormData();
        batchFiles.forEach((file) => formData.append("images[]", file));
        formData.append("type", pageType);

        const response = await apiService.post<BulkUploadResponse>("/bulk-upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const batchData = response.data;
        accumulatedResults.success.push(...(batchData.success || []));
        accumulatedResults.skipped.push(...(batchData.skipped || []));
        
        if(batchData.failed) {
            accumulatedResults.failed.invalid_format.push(...(batchData.failed.invalid_format || []));
            accumulatedResults.failed.user_not_found.push(...(batchData.failed.user_not_found || []));
            accumulatedResults.failed.profile_exists.push(...(batchData.failed.profile_exists || []));
            accumulatedResults.failed.upload_failed.push(...(batchData.failed.upload_failed || []));
        }
      }

      setUploadResults(accumulatedResults);
      setShowModal(true);
      setFiles(null);
      setPreviews([]);
      toast.success("Upload process complete!");

    } catch (error) {
      toast.error("An error occurred during upload.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 relative w-full">
      <Toaster position="top-right" />

      {/* --- 2. USE PORTAL FOR LOADER --- 
          This moves the loader to document.body, allowing it to cover the Sidebar.
      */}
      {isUploading && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl flex flex-col items-center animate-pulse w-full max-w-sm text-center">
            <FaSpinner className="animate-spin text-5xl md:text-6xl text-blue-600 mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Processing Upload</h3>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Please wait while we process your images...<br/>
              <span className="text-xs text-blue-500 font-semibold block mt-1">Do not close this window.</span>
            </p>
          </div>
        </div>,
        document.body
      )}

      <Breadcrumbs crumbs={crumbs} />

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 w-full text-black">
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Bulk Image Upload</h2>

          {/* DROP ZONE */}
          <div
            ref={dropRef}
            className={`border-2 border-dashed transition-all cursor-pointer px-4 py-8 md:py-10 text-center rounded-lg min-h-[200px] flex flex-col ${
              dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
            } ${
              previews.length > 0 
                ? "justify-start" 
                : "justify-center items-center"
            }`}
            tabIndex={0}
            role="button"
            aria-label="Click or drag images to upload"
            onClick={() => inputRef.current?.click()}
          >
            {previews.length === 0 ? (
              <>
                <FaCloudUploadAlt className="text-4xl md:text-5xl text-blue-700 mb-3" />
                <span className="block font-bold text-base md:text-lg mb-1">
                  Click or drag images to upload
                </span>
                <span className="block text-xs text-gray-500">
                  Accepts JPG, PNG, WebP.
                </span>
              </>
            ) : (
              <div className="w-full">
                <div className="text-center mb-4">
                  <span className="block font-bold text-base md:text-lg mb-1">
                    {previews.length} image{previews.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="block text-xs text-gray-500">
                    Click to add more images or drag and drop
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
                  {previews.map((src, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg shadow border overflow-hidden bg-white group aspect-square"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageAtIndex(index);
                        }}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold focus:outline-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-[10px] text-white px-1 py-1 truncate text-center">
                        {files?.[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              id="bulk-upload-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="w-full max-w-2xl mx-auto pt-4">
              <button
                disabled={isUploading}
                onClick={handleBulkUpload}
                className="flex items-center justify-center w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm md:text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FaCloudUploadAlt className="mr-2 text-lg" />
                {isUploading ? "Uploading..." : `Upload ${previews.length} Image${previews.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- 3. USE PORTAL FOR RESULTS MODAL --- */}
      {showModal && createPortal(
        <div className="relative z-[9999]">
            <UploadResultsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                results={uploadResults}
                pageType={pageType}
            />
        </div>,
        document.body
      )}
    </div>
  );
};

export default BulkImageUpload;