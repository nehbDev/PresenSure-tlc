import { lazy, Suspense } from "react"; // ✅ Import lazy and Suspense
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../services/ProtectedRoute";

// ✅ 1. Lazy Load all pages to split the bundle size
const LoginPage = lazy(() => import("../pages/loginPage"));
const Dashboard = lazy(() => import("../pages/dashboard"));

// Student Pages
const Student = lazy(() => import("../pages/student"));
const StudentBulkRegistration = lazy(
  () => import("../components/bulkRegistration/studentBulkRegistration"),
);
const BulkImageUpload = lazy(
  () => import("../components/bulkRegistration/BulkImageUpload"),
);
const StudentManualRegister = lazy(
  () => import("../components/manualRegistration/StudentManualRegister"),
);
const StudentDetails = lazy(() => import("../pages/StudentDetails"));
const StudentEdit = lazy(() => import("../components/editDetails/StudentEdit"));
const ArchiveStudent = lazy(() => import("../pages/ArchiveStudent"));

// Instructor Pages
const Instructor = lazy(() => import("../pages/instructor"));
const BulkInstructorRegistration = lazy(
  () => import("../components/bulkRegistration/instructorBulkRegistration"),
);
const InstructorManualRegister = lazy(
  () => import("../components/manualRegistration/InstructorManualRegister"),
);
const InstructorDetails = lazy(() => import("../pages/InstructorDetails"));
const InstructorEdit = lazy(
  () => import("../components/editDetails/InstructorEdit"),
);
const ArchiveInstructor = lazy(() => import("../pages/ArchiveInstructor"));

// Schedule Pages
const Schedule = lazy(() => import("../pages/schedule"));
const BulkSchedule = lazy(
  () => import("../components/bulkRegistration/BulkSchedule"),
);
const AddSchedule = lazy(
  () => import("../components/manualRegistration/addSchedule"),
);
const ScheduleDetails = lazy(() => import("../pages/scheduleDetails"));
const EditSchedule = lazy(
  () => import("../components/editDetails/EditSchedule"),
);
const ArchiveCourse = lazy(() => import("../pages/ArchiveCourse"));

// Semester Pages
const SemesterPage = lazy(() => import("../pages/semester"));
const AddSemester = lazy(
  () => import("../components/manualRegistration/AddSemester"),
);
const SemesterDetails = lazy(() => import("../pages/SemesterDetails"));
const EditSemester = lazy(
  () => import("../components/editDetails/EditSemester"),
);

// Records & My Schedule
const Records = lazy(() => import("../pages/AttendanceRecord"));
const CourseAttendanceSessions = lazy(
  () => import("../pages/CourseAttendanceSessions"),
);
const AttendanceSessionDetails = lazy(
  () => import("../pages/AttendanceSessionDetails"),
);
const MySchedule = lazy(() => import("../pages/mySchedule"));
const MySubjectDetails = lazy(() => import("../pages/myScheduleDetails"));
const BulkAddStudents = lazy(
  () => import("../components/bulkRegistration/BulkAddStudents"),
);
const BulkRemoveStudents = lazy(
  () => import("../components/bulkRegistration/BulkRemoveStudents"),
);
const Rules = lazy(() => import("../pages/myRules"));
const PolicyForm = lazy(
  () => import("../components/manualRegistration/PolicyForm"),
);

// ✅ Simple Loading Spinner Component for fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-blue-600">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      {/* ✅ 2. Wrap Routes in Suspense to handle the lazy loading */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Student Routes */}
              <Route path="/students" element={<Student />} />
              <Route
                path="/students/bulk-registration"
                element={<StudentBulkRegistration />}
              />
              <Route
                path="/students/manual-registration"
                element={<StudentManualRegister />}
              />
              <Route
                path="/students/bulk-image-upload"
                element={<BulkImageUpload />}
              />
              <Route
                path="/students/student-details"
                element={<StudentDetails />}
              />
              <Route path="/students/student-edit" element={<StudentEdit />} />
              <Route path="/students/archives" element={<ArchiveStudent />} />

              {/* Instructor Routes */}
              <Route path="/instructors" element={<Instructor />} />
              <Route
                path="/instructors/bulk-registration"
                element={<BulkInstructorRegistration />}
              />
              <Route
                path="/instructors/bulk-image-upload"
                element={<BulkImageUpload />}
              />
              <Route
                path="/instructors/manual-registration"
                element={<InstructorManualRegister />}
              />
              <Route
                path="/instructors/instructor-details"
                element={<InstructorDetails />}
              />
              <Route
                path="/instructors/instructor-edit"
                element={<InstructorEdit />}
              />
              <Route
                path="/instructors/archives"
                element={<ArchiveInstructor />}
              />

              {/* Schedule Routes */}
              <Route path="/schedules" element={<Schedule />} />
              <Route
                path="/schedules/import-schedule"
                element={<BulkSchedule />}
              />
              <Route
                path="/schedules/create-schedule"
                element={<AddSchedule />}
              />
              <Route
                path="/schedules/schedule-details"
                element={<ScheduleDetails />}
              />
              <Route
                path="/schedules/schedule-edit"
                element={<EditSchedule />}
              />
              <Route
                path="/schedules/schedule-archives"
                element={<ArchiveCourse />}
              />

              {/* Semester Routes */}
              <Route path="/semester" element={<SemesterPage />} />
              <Route
                path="/semester/create-semester"
                element={<AddSemester />}
              />
              <Route path="/semester/details" element={<SemesterDetails />} />
              <Route path="/semester/edit" element={<EditSemester />} />

              {/* My Schedule Routes */}
              <Route path="/mySchedule" element={<MySchedule />} />
              <Route
                path="/mySchedule/subject/:id"
                element={<MySubjectDetails />}
              />
              <Route
                path="/mySchedule/subjects/:id/bulk-add-students"
                element={<BulkAddStudents />}
              />
              <Route
                path="/mySchedule/subjects/:id/bulk-remove-students"
                element={<BulkRemoveStudents />}
              />

              {/* Records Routes */}
              <Route path="/records" element={<Records />} />
              <Route
                path="/records/attendance/:courseId"
                element={<CourseAttendanceSessions />}
              />
              <Route
                path="/records/session/:sessionId"
                element={<AttendanceSessionDetails />}
              />

              {/* Policies Routes */}
              <Route path="/rules" element={<Rules />} />
              <Route
                path="/attendance-policies/create"
                element={<PolicyForm />}
              />
              <Route
                path="/attendance-policies/edit/:id"
                element={<PolicyForm />}
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
