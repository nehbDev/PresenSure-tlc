import React from "react";
import ContentLoader from "react-content-loader";

const StudentDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Breadcrumbs Placeholder (Optional strip) */}


      {/* 2. Student Header Card Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-200">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Profile Image Skeleton */}
          <div className="flex-shrink-0">
            <ContentLoader
              speed={2}
              width={128}
              height={128}
              viewBox="0 0 128 128"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <circle cx="64" cy="64" r="64" />
            </ContentLoader>
          </div>

          {/* Info Section Skeleton */}
          <div className="flex-1 w-full">
            <ContentLoader
              speed={2}
              width="100%"
              height={160}
              viewBox="0 0 600 160"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
              preserveAspectRatio="xMinYMin meet"
            >
              {/* Name */}
              <rect x="0" y="10" rx="4" ry="4" width="350" height="28" />
              
              {/* Badges Row (ID, Sex, Status) */}
              <rect x="0" y="50" rx="4" ry="4" width="100" height="24" />
              <rect x="110" y="50" rx="4" ry="4" width="80" height="24" />
              <rect x="200" y="50" rx="4" ry="4" width="80" height="24" />

              {/* Grid System (Program, Year, Block) */}
              <rect x="0" y="90" rx="4" ry="4" width="180" height="60" />
              <rect x="190" y="90" rx="4" ry="4" width="180" height="60" />
              <rect x="380" y="90" rx="4" ry="4" width="180" height="60" />
            </ContentLoader>
          </div>
        </div>
      </div>

      {/* 3. Enrolled Courses Section Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Section Title */}
        <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>

        <div className="grid grid-cols-1 gap-4">
          {/* Render 3 Dummy Course Cards */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border rounded-lg overflow-hidden border-gray-200"
            >
              <div className="bg-gray-50 p-4 border-b border-gray-200 border-l-4 border-l-gray-300">
                <ContentLoader
                  speed={2}
                  width="100%"
                  height={50}
                  viewBox="0 0 800 50"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  preserveAspectRatio="xMinYMid meet"
                >
                  {/* Subject Code */}
                  <rect x="0" y="0" rx="3" ry="3" width="120" height="20" />
                  {/* Description */}
                  <rect x="0" y="30" rx="3" ry="3" width="250" height="15" />
                  
                  {/* Schedules (Right aligned simulation) */}
                  <rect x="550" y="10" rx="3" ry="3" width="250" height="30" />
                </ContentLoader>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsSkeleton;