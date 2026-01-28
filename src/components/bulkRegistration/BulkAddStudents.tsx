import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Breadcrumbs from "../../layout/Breadcrumbs";
import apiService from "../../services/ApiService";
import FileUploader from "../fileUploaders/FileUploaderBulkAddStudents";
import ImportTabs from "../tabs/ImportTabsBulkAddStudents";

// Define interfaces for API responses
interface StudentData {
  id: string;
  firstname: string;
  middle_initial: string;
  lastname: string;
  suffix?: string;
  sex: string;
  course?: string;
  year_level?: string;
  section?: string;
  enrollment_status?: string;
  [key: string]: any;
}

interface InvalidStudent {
  student_id: string | null;
  fullname: string;
  reason: string;
}

interface ImportResponse {
  data: {
    to_enroll: StudentData[];
    already_enrolled: StudentData[];
    invalid: InvalidStudent[];
  };
  message?: string;
  status?: string;
}

interface StoreBulkResponse {
  data: any;
  message?: string;
  status?: string;
}

interface Course {
  course_id: number;
  subject_code: string;
  description: string;
  units: number;
}

interface CourseResponse {
  data: Course;
  message?: string;
  status?: string;
}

const BulkAddStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // course id

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [importedData, setImportedData] = useState<{
    to_enroll: StudentData[];
    already_enrolled: StudentData[];
    invalid: InvalidStudent[];
  }>({
    to_enroll: [],
    already_enrolled: [],
    invalid: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<
    "to_enroll" | "already_enrolled" | "invalid"
  >("to_enroll");

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.get<CourseResponse>(`/viewCourse/${id}`);
        setCourse(response.data.data || null);
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Error loading course information");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
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
    formData.append("course_id", id || ""); // attach course id
    setIsUploading(true);

    try {
      const response = await apiService.post<ImportResponse>(
        "/importCourseStudents",
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
          invalid: response.data.data.invalid || [],
        });
        setSelectedCategory("to_enroll");
      } else {
        toast.error("Unexpected response structure.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Upload failed.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleSaveToDatabase = async () => {
    const usersToEnroll = importedData.to_enroll || [];

    if (usersToEnroll.length === 0) {
      toast.error("No students to enroll.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiService.post<StoreBulkResponse>(
        "/storeBulkUserCourses",
        {
          to_register: usersToEnroll.map((student) => ({
            user_id: student.id,
            course_id: id,
          })),
        }
      );

      toast.success(response.data.message || "Students enrolled successfully!");
      setImportedData({
        to_enroll: [],
        already_enrolled: [],
        invalid: [],
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to save students.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-sm text-gray-600">Loading course information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        crumbs={[
          { label: "My Schedule", to: "/myschedule" },
          { 
            label: course 
              ? `${course.subject_code}` 
              : "Course Details", 
            to: `/mySchedule/subject/${id}` 
          },
          { label: "Bulk Add Students" },
        ]}
      />
      <Toaster position="top-right" />

      {/* File Upload Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <FileUploader
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </div>

      {/* Results Section */}
      {(importedData.to_enroll.length > 0 ||
        importedData.already_enrolled.length > 0 ||
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

export default BulkAddStudents;