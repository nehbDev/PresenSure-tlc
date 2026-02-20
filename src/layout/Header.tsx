import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
import SemesterSkeleton from "../components/contentLoader/SemesterSkeleton"; 

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  toggleSidebar: () => void;
  userName: string | null;
  userEmail: string | null;
  role: string | null;
  semesterInfo: any;
  loadingSemester?: boolean; 
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  // ✅ New Props to trigger modals in Layout
  onOpenPolicy: () => void;
  onOpenPassword: () => void;
  onOpenLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  userName,
  userEmail,
  role,
  semesterInfo,
  loadingSemester = false,
  onOpenPolicy,
  onOpenPassword,
  onOpenLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getInitials = (name: string | null) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "U";

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/students")) return "Students";
    if (path.startsWith("/instructors")) return "Instructors";
    if (path.startsWith("/schedules")) return "Schedules";
    if (path.startsWith("/semester")) return "Semesters";
    if (path.startsWith("/records")) return "Attendance";
    if (path.startsWith("/mySchedule")) return "My Schedule";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/change-password")) return "Password";
    return "PresenSure";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white text-gray-800 px-4 md:px-6 flex items-center sticky top-0 z-20 shadow-sm border-b border-gray-200 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-blue-600 mr-2 md:mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {loadingSemester ? (
            <div className="hidden md:block">
                <SemesterSkeleton />
            </div>
          ) : semesterInfo ? (
            <div className="hidden lg:flex items-center mr-2 space-x-4">
              <div className="flex flex-col items-end">
                <p className="text-xs font-medium text-gray-700">
                  {semesterInfo.description}
                </p>
                <p className="text-xs text-gray-600">
                  SY {semesterInfo.schoolyear_start}–{semesterInfo.schoolyear_end}
                </p>
              </div>
            </div>
          ) : null}
          
          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-1 md:p-2 transition-colors duration-200"
              onClick={toggleDropdown}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shadow-sm">
                <span className="text-xs md:text-sm font-bold">
                  {getInitials(userName)}
                </span>
              </div>
              <div className="hidden md:block ml-2">
                <p className="font-medium text-sm text-gray-800 leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">{role}</p>
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fadeIn">
                <div className="p-4 border-b border-gray-200 md:hidden">
                  <p className="font-medium text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  <p className="text-xs text-blue-600 mt-1 uppercase">{role}</p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      onOpenPassword(); // ✅ Calls parent
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm rounded-md flex items-center hover:bg-gray-100 transition-colors duration-200 text-gray-700"
                  >
                    <FaCog className="mr-3 text-gray-500" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenPolicy(); // ✅ Calls parent
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm rounded-md flex items-center hover:bg-gray-100 transition-colors duration-200 text-gray-700"
                  >
                    <FaCog className="mr-3 text-gray-500" />
                    <span>Policy</span>
                  </button>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onOpenLogout(); // ✅ Calls parent
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm rounded-md flex items-center hover:bg-red-50 transition-colors duration-200 text-red-600"
                  >
                    <FaSignOutAlt className="mr-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;