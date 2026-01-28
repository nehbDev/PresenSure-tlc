// src/layout/Sidebar.tsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaUser,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendar,
  FaSchool,
  FaClipboardList,
  FaClock,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import logo from "../assets/icon_nobg.webp"

interface SidebarProps {
  isSidebarCollapsed: boolean;
  role: string | null;
  userName: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed, role }) => {
  const location = useLocation();
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const usersMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  const isUserSubActive =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/instructors");

  const linkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-2 px-3 rounded-lg transition-all duration-200 group ${
      isActive
        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    } ${isSidebarCollapsed ? "justify-center" : ""}`;

  const subLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-2 px-3 rounded-lg transition-all duration-200 group ${
      isActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    } ${isSidebarCollapsed ? "justify-center" : "ml-6"}`;

  const staticLinkStyles = (active: boolean) =>
    `flex items-center py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer group ${
      active
        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    } ${isSidebarCollapsed ? "justify-center" : ""}`;

  const iconStyles = (isActive: boolean) =>
    `transition-colors duration-200 ${
      isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
    }`;

  // Close dropdown only when sidebar is collapsed
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isSidebarCollapsed &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        usersMenuRef.current &&
        !usersMenuRef.current.contains(e.target as Node)
      ) {
        setIsUsersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarCollapsed]);

  // Close dropdown when route changes only if sidebar is collapsed
  useEffect(() => {
    if (isSidebarCollapsed) {
      setIsUsersOpen(false);
    }
  }, [location, isSidebarCollapsed]);

  return (
    <aside
      className={`bg-white h-full fixed flex flex-col justify-between shadow-xl transition-all duration-300 ease-in-out z-50 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
      style={{ overflow: "visible" }}
    >
      {/* Logo Section */}
      <div className="h-16 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center p-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center">
              <img src={logo} alt="PresenSure Logo" className="h-12 w-12" />
          
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-2">
              <h1 className="text-lg font-bold text-gray-800">PresenSure</h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 mt-4 relative overflow-y-auto custom-scrollbar">
        <nav className="space-y-1">
          {/* Dashboard */}
          {/* <NavLink
            to="/dashboard"
            className={linkStyles}
            title="Dashboard"
            onMouseEnter={() => setActiveHover("dashboard")}
            onMouseLeave={() => setActiveHover(null)}
          >
            <div className="w-5 flex justify-center">
              <MdDashboard
                className={`w-5 h-5 ${iconStyles(
                  location.pathname === "/dashboard"
                )}`}
              />
            </div>
            {!isSidebarCollapsed && <span className="ml-3">Dashboard</span>}
            {isSidebarCollapsed && activeHover === "dashboard" && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg z-50">
                Dashboard
              </div>
            )}
          </NavLink> */}

          {/* Users Dropdown */}
          {role !== "instructor" && (
            <div className="relative" ref={usersMenuRef}>
              <button
                onClick={() => setIsUsersOpen((prev) => !prev)}
                className={`${staticLinkStyles(isUserSubActive)} w-full`}
                title="Users"
              >
                <div className="w-5 flex justify-center">
                  <FaUser
                    className={`w-5 h-5 ${iconStyles(isUserSubActive)}`}
                  />
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Users</span>
                    {isUsersOpen ? (
                      <FaChevronUp className="w-3 h-3 text-gray-400" />
                    ) : (
                      <FaChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </>
                )}
              </button>

              {/* Expanded dropdown (always open when clicked and sidebar expanded) */}
              {!isSidebarCollapsed && isUsersOpen && (
                <div className="mt-1 ml-2 pl-2 border-l border-gray-200 space-y-1">
                  <NavLink to="/students" className={subLinkStyles}>
                    <div className="w-5 flex justify-center">
                      <FaGraduationCap className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                    </div>
                    <span className="ml-3 flex-1">Students</span>
                  </NavLink>
                  <NavLink to="/instructors" className={subLinkStyles}>
                    <div className="w-5 flex justify-center">
                      <FaChalkboardTeacher className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                    </div>
                    <span className="ml-3 flex-1">Instructors</span>
                  </NavLink>
                </div>
              )}

              {/* Collapsed dropdown floating in main page */}
              {isSidebarCollapsed && isUsersOpen && (
                <div
                  ref={dropdownRef}
                  className="fixed z-50 bg-white shadow-lg rounded-md border p-2 w-40"
                  style={{
                    left: "4rem",
                    top: usersMenuRef.current
                      ? usersMenuRef.current.getBoundingClientRect().top + "px"
                      : "80px",
                  }}
                >
                  <NavLink
                    to="/students"
                    className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700"
                  >
                    <FaGraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                    Students
                  </NavLink>
                  <NavLink
                    to="/instructors"
                    className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700"
                  >
                    <FaChalkboardTeacher className="w-4 h-4 mr-2 text-gray-500" />
                    Instructors
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {role !== "instructor" && (
            <>
              {/* Schedules */}
              <NavLink to="/schedules" className={linkStyles}>
                <div className="w-5 flex justify-center">
                  <FaCalendar
                    className={`w-5 h-5 ${iconStyles(
                      location.pathname.startsWith("/schedules")
                    )}`}
                  />
                </div>
                {!isSidebarCollapsed && <span className="ml-3">Schedules</span>}
              </NavLink>

              {/* Semester */}
              <NavLink to="/semester" className={linkStyles}>
                <div className="w-5 flex justify-center">
                  <FaSchool
                    className={`w-5 h-5 ${iconStyles(
                      location.pathname.startsWith("/semester")
                    )}`}
                  />
                </div>
                {!isSidebarCollapsed && <span className="ml-3">Semesters</span>}
              </NavLink> 
            </>
          )}
      
          <NavLink to="/records" className={linkStyles}>
            <div className="w-5 flex justify-center">
              <FaClipboardList
                className={`w-5 h-5 ${iconStyles(
                  location.pathname.startsWith("/records")
                )}`}
              />
            </div>
            {!isSidebarCollapsed && <span className="ml-3">Records</span>}
          </NavLink>

          {/* My Schedule */}
          <NavLink to="/mySchedule" className={linkStyles}>
            <div className="w-5 flex justify-center">
              <FaClock
                className={`w-5 h-5 ${iconStyles(
                  location.pathname.startsWith("/mySchedule")
                )}`}
              />
            </div>
            {!isSidebarCollapsed && <span className="ml-3">My Schedule</span>}
          </NavLink>

          {/* Rules 
          <NavLink to="/rules" className={linkStyles}>
            <div className="w-5 flex justify-center">
              <FaClock
                className={`w-5 h-5 ${iconStyles(
                  location.pathname.startsWith("/rules")
                )}`}
              />
            </div>
            {!isSidebarCollapsed && <span className="ml-3">My Rules</span>}
          </NavLink>*/}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
