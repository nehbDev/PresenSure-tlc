import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const hasShownToast = useRef(false); // track toast display
  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage && !hasShownToast.current) {
      toast.success(successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage]);

  return (
    <div>
      <Toaster position="top-center" />
      <h1 className="text-xl font-bold text-red-800">dashboard</h1>
    </div>
  );
};

export default Dashboard;
