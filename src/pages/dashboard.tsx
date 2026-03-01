import React, { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendar,
  FaSchool,
  FaClipboardList,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const Dashboard: React.FC = () => {
  const hasShownToast = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.successMessage;

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const role = user?.role || null;
  const userName = user?.firstName || user?.name || null;

  const dashboardItems = [
    {
      title: "Students",
      path: "/students",
      icon: <FaGraduationCap className="w-8 h-8 text-blue-500" />,
      description:
        "Manage student profiles, enrollment, and general information.",
      restrictedToAdmin: true,
    },
    {
      title: "Instructors",
      path: "/instructors",
      icon: <FaChalkboardTeacher className="w-8 h-8 text-blue-500" />,
      description: "View and manage instructor profiles and assignments.",
      restrictedToAdmin: true,
    },
    {
      title: "Schedules",
      path: "/schedules",
      icon: <FaCalendar className="w-8 h-8 text-blue-500" />,
      description: "Create and modify class and teaching schedules.",
      restrictedToAdmin: true,
    },
    {
      title: "Semesters",
      path: "/semester",
      icon: <FaSchool className="w-8 h-8 text-blue-500" />,
      description: "Manage academic terms, dates, and semester configurations.",
      restrictedToAdmin: true,
    },
    {
      title: "Records",
      path: "/records",
      icon: <FaClipboardList className="w-8 h-8 text-blue-500" />,
      description: "Access academic records, attendance logs, and reports.",
      restrictedToAdmin: false,
    },
    {
      title: "My Schedule",
      path: "/mySchedule",
      icon: <FaClock className="w-8 h-8 text-blue-500" />,
      description:
        "View your personal classes, shifts, and assigned timetable.",
      restrictedToAdmin: false,
    },
  ];

  const isUserInstructor = role?.toLowerCase().trim() === "instructor";
  const visibleItems = dashboardItems.filter(
    (item) => !(isUserInstructor && item.restrictedToAdmin),
  );
  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage]);

  return (
    <div className="space-y-4">
      <Toaster position="top-center" />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {userName || "User"}!s
        </h1>
        <p className="text-gray-500 mt-2">
          Here is an overview of your PresenSure workspace. Select an option
          below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                {item.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {item.title}
              </h2>
            </div>
            <p className="text-gray-600 flex-grow text-sm">
              {item.description}
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm">
              <span>Go to {item.title}</span>
              <FaArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
