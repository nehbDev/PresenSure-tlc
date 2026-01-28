import React from "react";
import ContentLoader from "react-content-loader";

const StudentEditSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Personal Info & Image */}
        <div className="flex-1">
          <ContentLoader
            speed={2}
            width="100%"
            height={600}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            // Use percentage for width to be responsive
            style={{ width: '100%' }}
          >
            {/* 1. Header Bar */}
            <rect x="0" y="0" rx="4" ry="4" width="100%" height="45" />

            {/* 2. Profile Image (Centered roughly) */}
            {/* We use a workaround for centering in SVG by using percentages if supported, 
                or just placing it reasonably for a generic skeleton */}
            <circle cx="50%" cy="120" r="50" />
            <rect x="35%" y="185" rx="3" ry="3" width="30%" height="15" />

            {/* 3. Form Inputs (7 fields) */}
            {/* Input 1 */}
            <rect x="0" y="230" rx="3" ry="3" width="30%" height="15" /> 
            <rect x="0" y="255" rx="4" ry="4" width="100%" height="42" />

            {/* Input 2 */}
            <rect x="0" y="315" rx="3" ry="3" width="20%" height="15" />
            <rect x="0" y="340" rx="4" ry="4" width="100%" height="42" />

            {/* Input 3 */}
            <rect x="0" y="400" rx="3" ry="3" width="25%" height="15" />
            <rect x="0" y="425" rx="4" ry="4" width="100%" height="42" />

            {/* Input 4 & 5 (Split row simulation) */}
            <rect x="0" y="485" rx="3" ry="3" width="48%" height="42" />
            <rect x="52%" y="485" rx="3" ry="3" width="48%" height="42" />
            
             {/* Input 6 */}
             <rect x="0" y="545" rx="4" ry="4" width="100%" height="42" />
          </ContentLoader>
        </div>

        {/* RIGHT COLUMN: Academic Info */}
        <div className="flex-1">
          <ContentLoader
            speed={2}
            width="100%"
            height={600}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={{ width: '100%' }}
          >
            {/* 1. Header Bar */}
            <rect x="0" y="0" rx="4" ry="4" width="100%" height="45" />

            {/* 2. Form Inputs (3 fields) */}
            {/* Input 1 */}
            <rect x="0" y="70" rx="3" ry="3" width="20%" height="15" />
            <rect x="0" y="95" rx="4" ry="4" width="100%" height="42" />

            {/* Input 2 */}
            <rect x="0" y="155" rx="3" ry="3" width="25%" height="15" />
            <rect x="0" y="180" rx="4" ry="4" width="100%" height="42" />

             {/* Input 3 */}
             <rect x="0" y="240" rx="3" ry="3" width="15%" height="15" />
             <rect x="0" y="265" rx="4" ry="4" width="100%" height="42" />

             {/* 3. Note Box */}
             <rect x="0" y="330" rx="4" ry="4" width="100%" height="80" />
          </ContentLoader>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <ContentLoader
            speed={2}
            width={300}
            height={50}
            viewBox="0 0 300 50"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
             {/* Cancel Button */}
             <rect x="80" y="5" rx="4" ry="4" width="100" height="40" />
             {/* Save Button */}
             <rect x="190" y="5" rx="4" ry="4" width="110" height="40" />
          </ContentLoader>
      </div>
    </div>
  );
};

export default StudentEditSkeleton;