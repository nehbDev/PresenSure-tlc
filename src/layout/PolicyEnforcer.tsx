import { useEffect, useState } from "react";
import apiService from "../services/ApiService"; // Check your path
import AttendancePolicyModal from "../components/modals/AttendancePolicyModal"; // Check your path

const PolicyEnforcer = () => {
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkPolicy = async () => {
    try {
      // ✅ FIX 1: Add <{ data: any }> to tell TypeScript what the response looks like
      const response = await apiService.get<{ data: any }>("/attendance-policy/my");
      
      // If data is null/empty, show modal
      if (!response.data.data) {
        setShowModal(true);
      }
    } catch (error: any) {
      // If 404, show modal
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
    window.location.reload(); 
  };

  if (checking) return null; 

  return (
    <AttendancePolicyModal
      isOpen={showModal}
      onClose={() => {}} 
      onSave={handlePolicySaved}
      forceCreate={true} // This requires the fix in step 2 below
    />
  );
};

export default PolicyEnforcer;