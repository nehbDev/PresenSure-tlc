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
  FaTimes,
  FaHome,
} from "react-icons/fa";
import logo from "../assets/icon_nobg.webp";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
  role: string | null;
  userName: string | null;
  isBlurred?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  isMobileOpen,
  closeMobileSidebar,
  role,
  isBlurred = false,
}) => {
  const location = useLocation();
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const usersMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUserSubActive =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/instructors");

  const showText = isMobileOpen || !isSidebarCollapsed;

  // --- STYLES ---
  const linkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-3 px-3 rounded-lg transition-all duration-200 group w-full ${
      isActive
        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    } ${!showText ? "justify-center" : "justify-start"}`;

  const subLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 group w-full ${
      isActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    } ${!showText ? "justify-center" : "ml-4"}`;

  const staticLinkStyles = (active: boolean) =>
    `flex items-center py-3 px-3 rounded-lg transition-all duration-200 cursor-pointer group w-full ${
      active
        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    } ${!showText ? "justify-center" : "justify-start"}`;

  const iconStyles = (isActive: boolean) =>
    `flex-shrink-0 transition-colors duration-200 ${
      isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
    }`;

  // --- EFFECTS ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isSidebarCollapsed &&
        !isMobileOpen &&
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
  }, [isSidebarCollapsed, isMobileOpen]);

  useEffect(() => {
    if (isSidebarCollapsed && !isMobileOpen) {
      setIsUsersOpen(false);
    }
  }, [location, isSidebarCollapsed, isMobileOpen]);

  const widthClass = isMobileOpen ? "w-64" : (isSidebarCollapsed ? "w-20" : "w-64");
  const transformClass = isMobileOpen 
    ? "translate-x-0 shadow-2xl" 
    : "max-md:-translate-x-full md:translate-x-0";
  const blurClass = isBlurred ? "filter blur-sm pointer-events-none select-none" : "";

  return (
    <aside
      className={`bg-white h-full fixed top-0 left-0 flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out z-50 
      ${widthClass} ${transformClass} ${blurClass}`}
      style={{ overflow: "visible" }}
    >
      <div className="h-16 flex-shrink-0 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className={`flex items-center ${!showText ? "justify-center w-full" : ""}`}>
          <img src={logo} alt="Logo" className="h-10 w-10 md:h-11 md:w-11 object-contain" />
          {showText && (
            <span className="ml-3 text-lg font-bold text-gray-800 whitespace-nowrap">
              PresenSure
            </span>
          )}
        </div>
        <button
          className="md:hidden text-gray-500 hover:text-red-500 p-1 rounded-md hover:bg-gray-100 transition-colors"
          onClick={closeMobileSidebar}
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-3 mt-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <nav className="space-y-1.5 pb-4">
          
          {/* VISIBLE TO EVERYONE: DASHBOARD */}
          <NavLink
            to="/dashboard"
            className={linkStyles}
            onClick={() => { if (isMobileOpen) closeMobileSidebar(); }}
            title={!showText ? "Dashboard" : ""}
          >
            <div className="w-6 flex justify-center items-center">
              <FaHome className={`w-5 h-5 ${iconStyles(location.pathname === "/dashboard" || location.pathname === "/")}`} />
            </div>
            {showText && <span className="ml-3 text-sm font-medium whitespace-nowrap">Dashboard</span>}
          </NavLink>

          {/* ROLE-RESTRICTED LINKS (Users, Schedules, Semesters) */}
          {role !== "instructor" && (
            <>
              {/* USERS MENU */}
              <div className="relative" ref={usersMenuRef}>
                <button
                  onClick={() => setIsUsersOpen((prev) => !prev)}
                  className={staticLinkStyles(isUserSubActive)}
                  title={!showText ? "Users" : ""}
                >
                  <div className="w-6 flex justify-center items-center">
                    <FaUser className={`w-5 h-5 ${iconStyles(isUserSubActive)}`} />
                  </div>
                  {showText && (
                    <>
                      <span className="ml-3 flex-1 text-left text-sm font-medium whitespace-nowrap">
                        Users
                      </span>
                      {isUsersOpen ? (
                        <FaChevronUp className="w-3 h-3 text-gray-400" />
                      ) : (
                        <FaChevronDown className="w-3 h-3 text-gray-400" />
                      )}
                    </>
                  )}
                </button>

                {/* Inline Submenu */}
                {showText && isUsersOpen && (
                  <div className="mt-1 space-y-1 overflow-hidden transition-all duration-200">
                    <NavLink to="/students" className={subLinkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }}>
                      <div className="w-6 flex justify-center items-center">
                        <FaGraduationCap className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                      </div>
                      <span className="ml-3 text-sm whitespace-nowrap">Students</span>
                    </NavLink>
                    <NavLink to="/instructors" className={subLinkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }}>
                      <div className="w-6 flex justify-center items-center">
                        <FaChalkboardTeacher className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                      </div>
                      <span className="ml-3 text-sm whitespace-nowrap">Instructors</span>
                    </NavLink>
                  </div>
                )}

                {/* Floating Tooltip Submenu */}
                {!isMobileOpen && isSidebarCollapsed && isUsersOpen && (
                  <div
                    ref={dropdownRef}
                    className="fixed z-50 bg-white shadow-xl rounded-lg border border-gray-200 p-2 w-48"
                    style={{
                      left: "4.5rem",
                      top: usersMenuRef.current ? usersMenuRef.current.getBoundingClientRect().top + "px" : "80px",
                    }}
                  >
                    <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">User Management</p>
                    <NavLink to="/students" className="flex items-center px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 transition-colors" onClick={() => setIsUsersOpen(false)}>
                      <FaGraduationCap className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Students</span>
                    </NavLink>
                    <NavLink to="/instructors" className="flex items-center px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 transition-colors" onClick={() => setIsUsersOpen(false)}>
                      <FaChalkboardTeacher className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Instructors</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* SCHEDULES */}
              <NavLink to="/schedules" className={linkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }} title={!showText ? "Schedules" : ""}>
                <div className="w-6 flex justify-center items-center">
                  <FaCalendar className={`w-5 h-5 ${iconStyles(location.pathname.startsWith("/schedules"))}`} />
                </div>
                {showText && <span className="ml-3 text-sm font-medium whitespace-nowrap">Schedules</span>}
              </NavLink>

              {/* SEMESTERS */}
              <NavLink to="/semester" className={linkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }} title={!showText ? "Semesters" : ""}>
                <div className="w-6 flex justify-center items-center">
                  <FaSchool className={`w-5 h-5 ${iconStyles(location.pathname.startsWith("/semester"))}`} />
                </div>
                {showText && <span className="ml-3 text-sm font-medium whitespace-nowrap">Semesters</span>}
              </NavLink>
            </>
          )}

          {/* VISIBLE TO EVERYONE: Records & My Schedule */}
          <NavLink to="/records" className={linkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }} title={!showText ? "Records" : ""}>
            <div className="w-6 flex justify-center items-center">
              <FaClipboardList className={`w-5 h-5 ${iconStyles(location.pathname.startsWith("/records"))}`} />
            </div>
            {showText && <span className="ml-3 text-sm font-medium whitespace-nowrap">Records</span>}
          </NavLink>

          <NavLink to="/mySchedule" className={linkStyles} onClick={() => { if (isMobileOpen) closeMobileSidebar(); }} title={!showText ? "My Schedule" : ""}>
            <div className="w-6 flex justify-center items-center">
              <FaClock className={`w-5 h-5 ${iconStyles(location.pathname.startsWith("/mySchedule"))}`} />
            </div>
            {showText && <span className="ml-3 text-sm font-medium whitespace-nowrap">My Schedule</span>}
          </NavLink>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;