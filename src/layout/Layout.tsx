import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import Header from "./Header";
import apiService from "../services/ApiService";
import PolicyEnforcer from "./PolicyEnforcer";

// Modals
import AttendancePolicyModal from "../components/modals/AttendancePolicyModal";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import LogoutModal from "../components/modals/LogoutModal";

// 1. Import the Context
import { ModalProvider, useModalContext } from "../context/ModalContext"; 

interface LayoutProps {
  children: React.ReactNode;
}

// Inner Component to consume the Context
const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  // 2. Get global modal state
  const { isModalOpen: isGlobalModalOpen } = useModalContext();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("Guest");
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [semesterInfo, setSemesterInfo] = useState<any>(null);
  const [isSemesterLoading, setIsSemesterLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Local Modal State
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 3. Combine Local and Global states to determine Blur
  const shouldBlur = isGlobalModalOpen || isPolicyModalOpen || isChangePasswordOpen || isLogoutModalOpen;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
        if (window.innerWidth < 1024) {
          setIsSidebarCollapsed(true);
        } else {
          setIsSidebarCollapsed(false);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role ?? null);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      } catch { console.error("Invalid user data"); }
    }
  }, []);

  useEffect(() => {
    const fetchSemester = async () => {
      setIsSemesterLoading(true);
      try {
        const cachedData = localStorage.getItem('semesterInfo');
        if (cachedData) {
          setSemesterInfo(JSON.parse(cachedData));
          setIsSemesterLoading(false);
          return;
        }
        const response = await apiService.get("/active-semester");
        setSemesterInfo(response.data);
        localStorage.setItem('semesterInfo', JSON.stringify(response.data));
      } catch (error) { console.error("Failed to fetch active semester"); } finally {
        setIsSemesterLoading(false);
      }
    };
    fetchSemester();
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const performLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("semesterInfo");
    toast.success("Logged out successfully");
    navigate("/");
    setIsLogoutModalOpen(false);
  };

  const contentTransform = isMobile && isMobileSidebarOpen ? "translateX(16rem)" : "translateX(0)";

  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-x-hidden relative transition-all duration-300">
        
        {role === 'instructor' && <PolicyEnforcer />}

        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          role={role}
          userName={userName}
          // 4. Pass the combined blur state
          isBlurred={shouldBlur}
        />

        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out 
          ${shouldBlur ? "blur-sm pointer-events-none select-none" : ""}`}
          style={{
            marginLeft: isMobile ? "0" : (isSidebarCollapsed ? "5rem" : "16rem"),
            width: isMobile ? "100%" : (isSidebarCollapsed ? "calc(100% - 5rem)" : "calc(100% - 16rem)"),
            transform: contentTransform,
          }}
        >
          <Header
            toggleSidebar={toggleSidebar}
            userName={userName}
            userEmail={userEmail}
            role={role}
            semesterInfo={semesterInfo}
            loadingSemester={isSemesterLoading}
            notifications={notifications}
            setNotifications={setNotifications}
            onOpenPolicy={() => setIsPolicyModalOpen(true)}
            onOpenPassword={() => setIsChangePasswordOpen(true)}
            onOpenLogout={() => setIsLogoutModalOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              {children}
          </main>
        </div>

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
      </div>
    </>
  );
};

// 5. Export the Layout wrapped in the Provider
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ModalProvider>
      <LayoutContent>{children}</LayoutContent>
    </ModalProvider>
  );
};

export default Layout;