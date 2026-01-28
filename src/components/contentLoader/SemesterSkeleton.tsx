import React from "react";

const SemesterSkeleton: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col items-start mr-2 space-y-1.5 animate-pulse min-w-[140px]">
      {/* Description Line (e.g., "First Semester") */}
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
      
      {/* School Year Line (e.g., "SY 2025-2026") */}
      <div className="h-3 w-24 bg-gray-200 rounded"></div>
      
      {/* Active Period Badge (e.g., "Midterm") */}
      <div className="h-3 w-16 bg-blue-100 rounded"></div>
    </div>
  );
};

export default SemesterSkeleton;