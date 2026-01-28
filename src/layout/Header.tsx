import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
// ✅ Import toast and Toaster
import toast from "react-hot-toast"; 

import AttendancePolicyModal from "../components/modals/AttendancePolicyModal";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import LogoutModal from "../components/modals/LogoutModal";
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
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  userName,
  userEmail,
  role,
  semesterInfo,
  loadingSemester = false, 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (name: string | null) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/students")) return "Student Management";
    if (path.startsWith("/instructors")) return "Instructor Management";
    if (path.startsWith("/schedules")) return "Schedule Management";
    if (path.startsWith("/semester")) return "Semester Management";
    if (path.startsWith("/records")) return "Attendance Records";
    if (path.startsWith("/mySchedule")) return "My Schedule";
    if (path.startsWith("/profile")) return "My Profile";
    if (path.startsWith("/change-password")) return "Change Password";
    return "PresenSure";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const performLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("semesterInfo");
    
    // ✅ Optional: Show logout success message
    toast.success("Logged out successfully");
    
    navigate("/");
    setIsLogoutModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* ✅ Add Toaster to render notifications */}

      <header className="h-16 bg-white text-gray-800 px-6 flex items-center sticky top-0 z-20 shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-blue-600 mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
              aria-label="Toggle Sidebar"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            
            {loadingSemester ? (
              <SemesterSkeleton />
            ) : semesterInfo ? (
              <div className="hidden md:flex items-center mr-2 space-x-4">
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium text-gray-700">
                    {semesterInfo.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    SY {semesterInfo.schoolyear_start}–
                    {semesterInfo.schoolyear_end}
                  </p>
                  <span className="text-sm font-semibold text-blue-600">
                    {semesterInfo.active_period}
                  </span>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-col items-start mr-2 space-x-4">
                <p className="text-sm font-medium text-red-600">No active</p>
                <p className="text-sm font-medium text-red-600">semester</p>
              </div>
            )}
            
            <div className="w-px h-10 bg-gray-300" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                onClick={toggleDropdown}
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center mr-2 shadow-sm">
                  <span className="text-sm font-bold">
                    {getInitials(userName)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-sm text-gray-800">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fadeIn">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-800">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {userEmail}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">{role}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsChangePasswordOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-md flex items-center hover:bg-gray-100 transition-colors duration-200 text-gray-700"
                    >
                      <FaCog className="mr-3 text-gray-500" />
                      <span>Change Password</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsPolicyModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-md flex items-center hover:bg-gray-100 transition-colors duration-200 text-gray-700"
                    >
                      <FaCog className="mr-3 text-gray-500" />
                      <span>Attendance Policy</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsLogoutModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-md flex items-center hover:bg-red-50 transition-colors duration-200 text-red-600"
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

      <AttendancePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSave={() => {}}
      />
      
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={performLogout}
      />
    </>
  );
};

export default Header;