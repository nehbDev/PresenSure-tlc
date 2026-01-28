import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import apiService from "../services/ApiService";
import type { Policy } from "../components/tables/PoliciesTable";
import PoliciesDataTable from "../components/tables/PoliciesTable";
const AttendancePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await apiService.get<{ data: Policy[] }>("/attendance-policies");
      setPolicies(response.data.data || []);
    } catch (error) {
      //toast.error("Error fetching policies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId: number) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await apiService.delete(`/attendance-policies/${policyId}`);
        toast.success("Policy deleted successfully");
        fetchPolicies();
      } catch (error) {
        toast.error("Error deleting policy");
        console.error("Error deleting policy:", error);
      }
    }
  };

  return (
    <div className="space-y-4 text-black p-6">
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Policies</h1>
        <Link
          to="/attendance-policies/create"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Create New Policy
        </Link> 
      </div>

      <PoliciesDataTable policies={policies} loading={loading} onDelete={handleDelete} />
    </div>
  );
};

export default AttendancePolicies;
