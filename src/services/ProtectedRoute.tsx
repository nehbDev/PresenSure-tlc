import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token"); // or check your auth state

    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
