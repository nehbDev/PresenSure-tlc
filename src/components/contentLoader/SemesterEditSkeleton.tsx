import React from "react";
//import ContentLoader from "react-content-loader";

const SemesterEditSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Stepper Skeleton */}
      <div className="flex justify-center mt-6 mb-8">
        <div className="flex items-center w-full max-w-4xl">
          {[1, 2, 3].map((_, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-24 bg-gray-200 rounded" />
              </div>
              {index < 2 && <div className="flex-1 h-1 mx-4 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Form Container Skeleton */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          {/* Header Strip */}
          <div className="bg-gray-200 px-4 py-3 h-12" />
          
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column Inputs */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-[42px] w-full bg-gray-100 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                    <div className="h-[42px] w-full bg-gray-100 rounded" />
                  </div>
                  <div>
                    <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                    <div className="h-[42px] w-full bg-gray-100 rounded" />
                  </div>
                </div>
              </div>

              {/* Right Column Inputs (Dates) */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-[42px] w-full bg-gray-100 rounded" />
                </div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-[42px] w-full bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons Skeleton */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <div className="h-10 w-24 bg-gray-200 rounded shadow" />
        </div>
      </div>
    </div>
  );
};

export default SemesterEditSkeleton;