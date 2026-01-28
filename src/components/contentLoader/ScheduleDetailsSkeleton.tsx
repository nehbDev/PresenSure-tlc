import React from "react";
import ContentLoader from "react-content-loader";

const ScheduleDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* --- Main Header Card Skeleton --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
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

          <div className="flex-1">
            <ContentLoader 
              speed={2}
              width="100%"
              height={160}
              viewBox="0 0 600 160"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="0" y="0" rx="4" ry="4" width="150" height="32" />
              <rect x="0" y="40" rx="4" ry="4" width="280" height="20" />
              <rect x="0" y="75" rx="4" ry="4" width="180" height="28" />
              <rect x="400" y="0" rx="6" ry="6" width="90" height="36" />
              <rect x="500" y="0" rx="6" ry="6" width="90" height="36" />

              {/* Course Schedule Cards */}
              <rect x="0" y="120" rx="6" ry="6" width="180" height="40" />
              <rect x="190" y="120" rx="6" ry="6" width="180" height="40" />
            </ContentLoader>
          </div>
        </div>
      </div>

      {/* --- Enrolled Students Tables Skeleton --- */}
      <div className="space-y-8">
        {[1, 2].map((tableIndex) => (
          <div key={tableIndex} className="space-y-2">
            {/* Table Header Strip (Male/Female Label) */}
            <div className={`h-14 w-full rounded-t-lg border-b ${tableIndex === 1 ? 'bg-blue-50' : 'bg-pink-50'} animate-pulse flex items-center px-4`}>
              <div className={`h-6 w-24 rounded ${tableIndex === 1 ? 'bg-blue-200' : 'bg-pink-200'}`} />
            </div>

            {/* Table Body (Columns and Rows) */}
            <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100">
              <ContentLoader 
                speed={2}
                width="100%"
                height={200}
                viewBox="0 0 800 200"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
              >
                {/* Table Header Row */}
                <rect x="0" y="0" rx="4" ry="4" width="800" height="35" />
                
                {/* 4 Dummy Rows */}
                {[1, 2, 3, 4].map((row) => (
                  <React.Fragment key={row}>
                    <circle cx="40" cy={50 + row * 35} r="15" /> {/* Profile Image */}
                    <rect x="80" y={42 + row * 35} rx="3" ry="3" width="100" height="15" /> {/* ID */}
                    <rect x="200" y={42 + row * 35} rx="3" ry="3" width="250" height="15" /> {/* Name */}
                    <rect x="470" y={42 + row * 35} rx="3" ry="3" width="80" height="15" /> {/* Program */}
                    <rect x="570" y={42 + row * 35} rx="3" ry="3" width="60" height="15" /> {/* Year */}
                    <rect x="750" y={38 + row * 35} rx="12" ry="12" width="24" height="24" /> {/* Action Button */}
                  </React.Fragment>
                ))}
              </ContentLoader>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDetailsSkeleton;