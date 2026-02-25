import React, { useState } from "react";
import type { FormEvent } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMobileAlt,
  FaDownload,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import apiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";

// ---- Interfaces ----
interface User {
  id: number;
  firstname: string;
  lastname: string;
  middle_initial?: string;
  role: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

const LoginPage: React.FC = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.post<LoginResponse>("/login", {
        id,
        password,
      });
      const { data } = response;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "student") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.error("Students cannot access the dashboard.");
        return;
      }
      navigate("/dashboard", {
        state: { successMessage: "Login successful!" },
      });
    } catch (error: any) {
      if (error.response && error.response.data?.errors) {
        const errors = error.response.data.errors;
        const combinedMessage = Object.values(errors)
          .map((err: any) => `• ${err[0]}`)
          .join("\n");

        toast.error(combinedMessage, {
          style: {
            whiteSpace: "pre-line",
            maxWidth: "90vw",
            width: "fit-content",
            minWidth: "200px",
          },
        });
      } else if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Added 'relative' to the container so the absolute button positions correctly
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-t from-blue-500 to-blue-200 p-4 sm:p-6 lg:p-8">
      <Toaster
        position="top-center"
        toastOptions={{
          error: {
            style: {
              background: "#fef2f2",
              color: "#b91c1c",
              borderRadius: "8px",
            },
            iconTheme: { primary: "#b91c1c", secondary: "#fef2f2" },
          },
        }}
      />

      {/* ✅ NEW LOCATION: Top Right Download Button */}
      <a
        href="https://github.com/nehbDev/PresenSure-tlc/releases/latest/download/PresenSure.03.apk"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 bg-blue-700 text-white hover:bg-white hover:text-blue-700 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 z-50 group border border-white/20"
      >
        <FaMobileAlt className="h-4 w-4" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          Download App
        </span>
        <span className="text-xs font-bold tracking-wide sm:hidden">
          Download App
        </span>
        <FaDownload className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      </a>

      {/* Header Section */}
      <div className="w-full max-w-sm flex flex-col items-center mb-6 sm:mb-8">
        <img
          src="/logo.webp"
          alt="PresenSure Logo"
          width="112"
          height="112"
          className="h-20 w-20 sm:h-28 sm:w-28 mb-4 transition-all"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 tracking-tight">
          PresenSure
        </h1>
      </div>

      <div className="w-full max-w-[380px] sm:max-w-sm">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 transition-all">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-5"
          >
            <input type="text" name="prevent_autofill" className="hidden" />

            {/* ID Field */}
            <div>
              <label
                htmlFor="id"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1"
              >
                ID Number
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50/50 transition-all"
                  placeholder="e.g. 2023-0001"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors px-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* REMOVED: Old Download App Section */}
        </div>
      </div>

      {/* Footer credit */}
      <p className="mt-8 text-blue-800/60 text-[10px] font-medium uppercase tracking-widest">
        © 2026 PresenSure-tlc
      </p>
    </div>
  );
};

export default LoginPage;
