import React from "react";
import ContentLoader from "react-content-loader";

const SemesterDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-200">
        <ContentLoader 
          speed={2}
          width={800}
          height={120}
          viewBox="0 0 800 120"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          {/* Description and Status Badge */}
          <rect x="0" y="0" rx="4" ry="4" width="300" height="32" />
          <rect x="315" y="4" rx="12" ry="12" width="80" height="24" />
          
          {/* School Year Text */}
          <rect x="0" y="45" rx="3" ry="3" width="200" height="20" />
          
          {/* Duration Badge */}
          <rect x="0" y="80" rx="4" ry="4" width="350" height="30" />
          
          {/* Edit Button (Right Side) */}
          <rect x="680" y="0" rx="6" ry="6" width="120" height="40" />
        </ContentLoader>
      </div>

      {/* Academic Periods Grid Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-6 w-48 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-2 border-gray-100 p-4 rounded-lg">
              <ContentLoader 
                speed={2}
                width="100%"
                height={150}
                viewBox="0 0 200 150"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
              >
                <rect x="0" y="0" rx="3" ry="3" width="60" height="12" />
                <circle cx="185" cy="6" r="6" />
                <rect x="0" y="25" rx="4" ry="4" width="140" height="20" />
                <rect x="0" y="65" rx="3" ry="3" width="80" height="12" />
                <rect x="0" y="82" rx="3" ry="3" width="120" height="12" />
                <rect x="0" y="105" rx="3" ry="3" width="80" height="12" />
                <rect x="0" y="122" rx="3" ry="3" width="120" height="12" />
              </ContentLoader>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemesterDetailsSkeleton;