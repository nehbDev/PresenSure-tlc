import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaFilter,
} from "react-icons/fa";
import Breadcrumbs from "../layout/Breadcrumbs";
import FixedColumnAttendanceTable from "../components/tables/FixedColumnAttendanceTable";

interface Course {
  id: number;
  course_code: string;
  description: string;
  instructor: string;
  units: number;
  schedule: string;
  students_count: number;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  sex: "male" | "female";
}

interface DailyAttendance {
  date: string;
  period: "prelim" | "midterm" | "finals";
  schedule_type: "regular" | "makeup" | "special";
  attendance: {
    [studentId: number]: "present" | "absent" | "late" | "excused";
  };
}

const AttendanceRecordDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<
    DailyAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [periodFilter, setPeriodFilter] = useState<
    "all" | "prelim" | "midterm" | "finals"
  >("all");
  const [scheduleFilter, setScheduleFilter] = useState<
    "all" | "regular" | "makeup" | "special"
  >("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");

  // Mock data for demonstration
  const mockCourse: Course = {
    id: 1,
    course_code: "CoC 5101-A",
    description: "INTRODUCTION TO COMPUTING",
    instructor: "Alexandra Grace Billodo",
    units: 3,
    schedule: "MWF 9:00-10:00 AM",
    students_count: 35,
  };

  const mockStudents: Student[] = [
    { id: 1, student_id: "20230001", name: "Aaron James Smith", sex: "male" },
    {
      id: 2,
      student_id: "20230002",
      name: "Maria Santos Garcia",
      sex: "female",
    },
    {
      id: 3,
      student_id: "20230003",
      name: "David William Johnson",
      sex: "male",
    },
    {
      id: 4,
      student_id: "20230004",
      name: "Sarah Marie Williams",
      sex: "female",
    },
    { id: 5, student_id: "20230005", name: "Michael James Brown", sex: "male" },
    {
      id: 6,
      student_id: "20230006",
      name: "Jennifer Lynn Davis",
      sex: "female",
    },
    {
      id: 7,
      student_id: "20230007",
      name: "Christopher Robert Miller",
      sex: "male",
    },
    {
      id: 8,
      student_id: "20230008",
      name: "Amanda Grace Wilson",
      sex: "female",
    },
    { id: 9, student_id: "20230009", name: "Daniel Thomas Moore", sex: "male" },
    {
      id: 10,
      student_id: "20230010",
      name: "Jessica Ann Taylor",
      sex: "female",
    },
    {
      id: 11,
      student_id: "20230011",
      name: "Kevin Andrew Anderson",
      sex: "male",
    },
    {
      id: 12,
      student_id: "20230012",
      name: "Emily Rose Thomas",
      sex: "female",
    },
    {
      id: 13,
      student_id: "20230013",
      name: "Brian Scott Jackson",
      sex: "male",
    },
    { id: 14, student_id: "20230014", name: "Olivia Mae White", sex: "female" },
    {
      id: 15,
      student_id: "20230015",
      name: "Matthew Paul Harris",
      sex: "male",
    },
  ];

  const mockDailyAttendance: DailyAttendance[] = [
    // Prelim Period - Regular Classes
    {
      date: "2024-01-15",
      period: "prelim",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "absent",
        3: "late",
        4: "present",
        5: "present",
        6: "present",
        7: "late",
        8: "present",
        9: "absent",
        10: "present",
        11: "present",
        12: "late",
        13: "present",
        14: "present",
        15: "excused",
      },
    },
    {
      date: "2024-01-17",
      period: "prelim",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "absent",
        4: "late",
        5: "present",
        6: "absent",
        7: "present",
        8: "present",
        9: "present",
        10: "late",
        11: "absent",
        12: "present",
        13: "present",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-01-19",
      period: "prelim",
      schedule_type: "regular",
      attendance: {
        1: "late",
        2: "present",
        3: "present",
        4: "present",
        5: "excused",
        6: "present",
        7: "present",
        8: "absent",
        9: "present",
        10: "present",
        11: "present",
        12: "present",
        13: "late",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-01-22",
      period: "prelim",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "absent",
        3: "present",
        4: "late",
        5: "present",
        6: "present",
        7: "absent",
        8: "present",
        9: "present",
        10: "present",
        11: "present",
        12: "absent",
        13: "present",
        14: "late",
        15: "present",
      },
    },
    {
      date: "2024-01-24",
      period: "prelim",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "present",
        5: "present",
        6: "late",
        7: "present",
        8: "present",
        9: "absent",
        10: "present",
        11: "present",
        12: "present",
        13: "present",
        14: "present",
        15: "present",
      },
    },

    // Prelim Period - Makeup Class
    {
      date: "2024-01-27",
      period: "prelim",
      schedule_type: "makeup",
      attendance: {
        1: "present",
        2: "present",
        3: "absent",
        4: "present",
        5: "present",
        6: "present",
        7: "present",
        8: "absent",
        9: "present",
        10: "present",
        11: "late",
        12: "present",
        13: "present",
        14: "present",
        15: "excused",
      },
    },

    // Midterm Period - Regular Classes
    {
      date: "2024-02-05",
      period: "midterm",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "late",
        5: "absent",
        6: "present",
        7: "present",
        8: "present",
        9: "present",
        10: "present",
        11: "present",
        12: "present",
        13: "absent",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-02-07",
      period: "midterm",
      schedule_type: "regular",
      attendance: {
        1: "late",
        2: "present",
        3: "present",
        4: "present",
        5: "present",
        6: "absent",
        7: "present",
        8: "present",
        9: "present",
        10: "late",
        11: "present",
        12: "present",
        13: "present",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-02-09",
      period: "midterm",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "absent",
        3: "present",
        4: "present",
        5: "present",
        6: "present",
        7: "late",
        8: "present",
        9: "present",
        10: "present",
        11: "present",
        12: "absent",
        13: "present",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-02-12",
      period: "midterm",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "absent",
        5: "present",
        6: "present",
        7: "present",
        8: "late",
        9: "present",
        10: "present",
        11: "present",
        12: "present",
        13: "present",
        14: "absent",
        15: "present",
      },
    },

    // Midterm Period - Special Class
    {
      date: "2024-02-14",
      period: "midterm",
      schedule_type: "special",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "present",
        5: "present",
        6: "present",
        7: "present",
        8: "present",
        9: "absent",
        10: "present",
        11: "present",
        12: "present",
        13: "present",
        14: "present",
        15: "late",
      },
    },

    // Finals Period - Regular Classes
    {
      date: "2024-03-04",
      period: "finals",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "late",
        4: "present",
        5: "present",
        6: "present",
        7: "present",
        8: "present",
        9: "present",
        10: "absent",
        11: "present",
        12: "present",
        13: "present",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-03-06",
      period: "finals",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "absent",
        3: "present",
        4: "present",
        5: "present",
        6: "present",
        7: "present",
        8: "late",
        9: "present",
        10: "present",
        11: "present",
        12: "present",
        13: "absent",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-03-08",
      period: "finals",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "present",
        5: "late",
        6: "present",
        7: "present",
        8: "present",
        9: "present",
        10: "present",
        11: "absent",
        12: "present",
        13: "present",
        14: "present",
        15: "present",
      },
    },
    {
      date: "2024-03-11",
      period: "finals",
      schedule_type: "regular",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "absent",
        5: "present",
        6: "present",
        7: "present",
        8: "present",
        9: "present",
        10: "present",
        11: "present",
        12: "late",
        13: "present",
        14: "present",
        15: "present",
      },
    },

    // Finals Period - Makeup Class
    {
      date: "2024-03-13",
      period: "finals",
      schedule_type: "makeup",
      attendance: {
        1: "present",
        2: "present",
        3: "present",
        4: "present",
        5: "present",
        6: "present",
        7: "absent",
        8: "present",
        9: "present",
        10: "present",
        11: "present",
        12: "present",
        13: "present",
        14: "late",
        15: "present",
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCourse(mockCourse);
      setStudents(mockStudents);
      setDailyAttendance(mockDailyAttendance);
      setFilteredAttendance(mockDailyAttendance);
      setLoading(false);
    }, 1000);
  }, [courseId]);

  // Filter attendance records based on selected filters
  useEffect(() => {
    let filtered = dailyAttendance;

    if (periodFilter !== "all") {
      filtered = filtered.filter((record) => record.period === periodFilter);
    }

    if (scheduleFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.schedule_type === scheduleFilter
      );
    }

    setFilteredAttendance(filtered);
  }, [periodFilter, scheduleFilter, dailyAttendance]);

  // Sort students by sex (females first, then males) and then alphabetically by name
  const sortedStudents = [...students].sort((a, b) => {
    // First sort by sex (female first)
    if (a.sex !== b.sex) {
      return a.sex === "female" ? -1 : 1;
    }
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  // Filter students if a specific student is selected
  const displayStudents =
    studentFilter === "all"
      ? sortedStudents
      : sortedStudents.filter(
          (student) => student.id.toString() === studentFilter
        );

  const crumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Attendance Records", to: "/records" },
    { label: course?.course_code || "Course Details" },
  ];

  // Calculate statistics
  const totalSessions = dailyAttendance.length;
  const prelimSessions = dailyAttendance.filter(
    (r) => r.period === "prelim"
  ).length;
  const midtermSessions = dailyAttendance.filter(
    (r) => r.period === "midterm"
  ).length;
  const finalsSessions = dailyAttendance.filter(
    (r) => r.period === "finals"
  ).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs crumbs={crumbs} />
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs crumbs={crumbs} />

      {/* Course Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {course?.course_code}
        </h1>
        <p className="text-gray-600 mb-4">{course?.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <FaUsers className="text-blue-600 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="font-semibold">{course?.instructor}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-green-600 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="font-semibold">{course?.schedule}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaClipboardList className="text-purple-600 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="font-semibold">{course?.students_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Prelim Sessions</p>
          <p className="text-3xl font-bold text-green-600">{prelimSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Midterm Sessions</p>
          <p className="text-3xl font-bold text-yellow-600">
            {midtermSessions}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Finals Sessions</p>
          <p className="text-3xl font-bold text-purple-600">{finalsSessions}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <FaFilter className="text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold">Filter Attendance Records</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Periods</option>
              <option value="prelim">Prelim</option>
              <option value="midterm">Midterm</option>
              <option value="finals">Finals</option>
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Students</option>
              {sortedStudents.map((student) => (
                <option key={student.id} value={student.id.toString()}>
                  {student.name} ({student.sex === "male" ? "M" : "F"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mt-4 flex flex-wrap gap-2">
          {periodFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Period: {periodFilter}
            </span>
          )}
          {scheduleFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Schedule: {scheduleFilter}
            </span>
          )}
          {studentFilter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Student:{" "}
              {students.find((s) => s.id.toString() === studentFilter)?.name}
            </span>
          )}
          {(periodFilter !== "all" ||
            scheduleFilter !== "all" ||
            studentFilter !== "all") && (
            <button
              onClick={() => {
                setPeriodFilter("all");
                setScheduleFilter("all");
                setStudentFilter("all");
              }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Student Attendance Records</h2>

          {/* ✅ Generate Report Button */}
          <button
            onClick={() => {
              // For now, navigate or generate PDF report
              // You can connect this later to your Laravel endpoint or PDF generator
              alert("Generating attendance report...");
            }}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition duration-200"
          >
            <FaClipboardList className="mr-2" />
            Generate Report
          </button>
        </div>

        {filteredAttendance.length > 0 ? (
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <div className="min-w-max">
              <FixedColumnAttendanceTable
                key={`attendance-table-${displayStudents.length}-${filteredAttendance.length}`}
                students={displayStudents}
                attendanceRecords={filteredAttendance}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No attendance records found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AttendanceRecordDetails;
