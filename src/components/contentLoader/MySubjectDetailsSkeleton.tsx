import React from "react";
import ContentLoader from "react-content-loader";

const MySubjectDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-2">
      {/* Subject Header Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <ContentLoader
          speed={2}
          width={400}
          height={30}
          viewBox="0 0 400 30"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="4" ry="4" width="350" height="25" />
        </ContentLoader>
      </div>

      {/* Schedules Section Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="mb-4">
          <ContentLoader
            speed={2}
            width={100}
            height={20}
            viewBox="0 0 100 20"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="3" ry="3" width="80" height="15" />
          </ContentLoader>
        </div>
        {/* Schedule Card Mockup */}
        <ContentLoader
          speed={2}
          width="100%"
          height={80}
          viewBox="0 0 800 80"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          preserveAspectRatio="none"
        >
          <rect x="0" y="0" rx="4" ry="4" width="100%" height="80" />
        </ContentLoader>
      </div>

      {/* Students Section Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="mb-6">
          <ContentLoader
            speed={2}
            width={150}
            height={20}
            viewBox="0 0 150 20"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="3" ry="3" width="120" height="15" />
          </ContentLoader>
        </div>

        {/* Simulate the split table look */}
        <div className="space-y-6">
          {/* Male Table Header Sim */}
          <ContentLoader
            speed={2}
            width="100%"
            height={40}
            viewBox="0 0 800 40"
            backgroundColor="#eff6ff"
            foregroundColor="#dbeafe"
            preserveAspectRatio="none"
            className="rounded-t-lg"
          >
            <rect x="0" y="0" width="100%" height="40" />
          </ContentLoader>
          {/* Rows */}
          <ContentLoader
            speed={2}
            width="100%"
            height={120}
            viewBox="0 0 800 120"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            preserveAspectRatio="none"
          >
            <rect x="0" y="0" rx="3" ry="3" width="100%" height="30" />
            <rect x="0" y="40" rx="3" ry="3" width="100%" height="30" />
            <rect x="0" y="80" rx="3" ry="3" width="100%" height="30" />
          </ContentLoader>

          {/* Female Table Header Sim */}
          <ContentLoader
            speed={2}
            width="100%"
            height={40}
            viewBox="0 0 800 40"
            backgroundColor="#fdf2f8"
            foregroundColor="#fce7f3"
            preserveAspectRatio="none"
            className="rounded-t-lg"
          >
            <rect x="0" y="0" width="100%" height="40" />
          </ContentLoader>
          {/* Rows */}
          <ContentLoader
            speed={2}
            width="100%"
            height={80}
            viewBox="0 0 800 80"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            preserveAspectRatio="none"
          >
            <rect x="0" y="0" rx="3" ry="3" width="100%" height="30" />
            <rect x="0" y="40" rx="3" ry="3" width="100%" height="30" />
          </ContentLoader>
        </div>
      </div>
    </div>
  );
};

export default MySubjectDetailsSkeleton;
