import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import apiService from "../services/ApiService";
import PolicyEnforcer from "./PolicyEnforcer"; // ✅ Import the Enforcer

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("Guest");
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [semesterInfo, setSemesterInfo] = useState<any>(null);
  const [isSemesterLoading, setIsSemesterLoading] = useState(true);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your schedule has been updated", time: "10 mins ago", read: false },
    { id: 2, text: "New announcement from Admin", time: "2 hours ago", read: false },
    { id: 3, text: "Meeting reminder: Faculty meeting at 3 PM", time: "1 day ago", read: true }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role ?? null);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      } catch {
        console.error("Invalid user data in storage");
      }
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
        const data = response.data;
        setSemesterInfo(data);
        localStorage.setItem('semesterInfo', JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch active semester:", error);
      } finally {
        setIsSemesterLoading(false); 
      }
    };
    fetchSemester();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* ✅ Add PolicyEnforcer Here. It checks logic silently unless Policy is missing. */}
      {role === 'instructor' && <PolicyEnforcer />}

      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        role={role}
        userName={userName}
      />
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarCollapsed ? "5rem" : "16rem",
          width: isSidebarCollapsed ? "calc(100% - 5rem)" : "calc(100% - 16rem)"
        }}
      >
        <Header
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userName={userName}
          userEmail={userEmail}
          role={role}
          semesterInfo={semesterInfo}
          loadingSemester={isSemesterLoading} 
          notifications={notifications}
          setNotifications={setNotifications}
        />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;