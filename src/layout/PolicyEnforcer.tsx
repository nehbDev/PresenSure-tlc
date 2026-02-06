import { useEffect, useState } from "react";
import apiService from "../services/ApiService";
import AttendancePolicyModal from "../components/modals/AttendancePolicyModal"; // Adjust path if needed

const PolicyEnforcer = () => {
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkPolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch the instructor's policies
      const response = await apiService.get<{ data: any[] }>("/attendance-policy/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const policies = response.data.data;

      // If the array is empty, it means they have NO policies. Force them to create one.
      if (Array.isArray(policies) && policies.length === 0) {
        setShowModal(true);
      }
    } catch (error: any) {
      console.error("Policy check failed:", error);
      // Optional: If 404 implies no policies found, show modal
      if (error.response && error.response.status === 404) {
        setShowModal(true);
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkPolicy();
  }, []);

  const handlePolicySaved = () => {
    setShowModal(false);
    // Optional: Reload to refresh the dashboard state
    window.location.reload(); 
  };

  // While checking, render nothing (or a small loader if you prefer)
  if (checking) return null; 

  if (!showModal) return null;

  return (
    <AttendancePolicyModal
      isOpen={showModal}
      onClose={() => {}} // Empty function: Prevent closing by clicking outside/Escape
      onSave={handlePolicySaved} // Pass the save handler
      forceCreate={true} // ✅ Tell the modal this is mandatory
    />
  );
};

export default PolicyEnforcer;