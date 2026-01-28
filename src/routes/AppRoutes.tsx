import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../services/ProtectedRoute";
import LoginPage from "../pages/loginPage";
import Dashboard from "../pages/dashboard";
import Student from "../pages/student";
import StudentBulkRegistration from "../components/bulkRegistration/studentBulkRegistration";
import BulkImageUpload from "../components/bulkRegistration/BulkImageUpload";
import StudentManualRegister from "../components/manualRegistration/StudentManualRegister";
import StudentDetails from "../pages/StudentDetails";
import StudentEdit from "../components/editDetails/StudentEdit";
import ArchiveStudent from "../pages/ArchiveStudent";
import Instructor from "../pages/instructor";
import BulkInstructorRegistration from "../components/bulkRegistration/instructorBulkRegistration";
import InstructorManualRegister from "../components/manualRegistration/InstructorManualRegister";
import InstructorDetails from "../pages/InstructorDetails";
import InstructorEdit from "../components/editDetails/InstructorEdit";
import ArchiveInstructor from "../pages/ArchiveInstructor";
import Schedule from "../pages/schedule";
import BulkSchedule from "../components/bulkRegistration/BulkSchedule";
import AddSchedule from "../components/manualRegistration/addSchedule";
import ScheduleDetails from "../pages/scheduleDetails";
import EditSchedule from "../components/editDetails/EditSchedule";
import ArchiveCourse from "../pages/ArchiveCourse";
import SemesterPage from "../pages/semester";
import SemesterDetails from "../pages/SemesterDetails";
import EditSemester from "../components/editDetails/EditSemester";
import Records from "../pages/AttendanceRecord";
import CourseAttendanceSessions from "../pages/CourseAttendanceSessions";
import AttendanceSessionDetails from "../pages/AttendanceSessionDetails";
import MySchedule from "../pages/mySchedule";
import MySubjectDetails from "../pages/myScheduleDetails";
import BulkAddStudents from "../components/bulkRegistration/BulkAddStudents";
import Rules from "../pages/myRules";
import PolicyForm from "../components/manualRegistration/PolicyForm";
//import AttendanceRecordDetails  from "../pages/AttendanceRecordDetails";
import AddSemester from "../components/manualRegistration/AddSemester";

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
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
            <Route path="/instructors/archives" element={<ArchiveInstructor />} />
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
            <Route path="/schedules/schedule-edit" element={<EditSchedule />} />
            <Route path="/schedules/schedule-archives" element={<ArchiveCourse />} />
            <Route path="/semester" element={<SemesterPage />} />
            <Route path="/semester/create-semester" element={<AddSemester />} />
            <Route path="/semester/details" element={<SemesterDetails />} />
            <Route path="/semester/edit" element={<EditSemester />} />
            <Route path="/mySchedule" element={<MySchedule />} />
            <Route
              path="/mySchedule/subject/:id"
              element={<MySubjectDetails />}
            />
            <Route
              path="/mySchedule/subjects/:id/bulk-add-students"
              element={<BulkAddStudents />}
            />
            <Route path="/records" element={<Records />} />
            <Route
              path="/records/attendance/:courseId"
              element={<CourseAttendanceSessions />}
            />
            <Route
              path="/records/session/:sessionId"
              element={<AttendanceSessionDetails />}
            />
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
    </>
  );
};

export default AppRoutes;
