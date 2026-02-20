import React from "react";
import ContentLoader from "react-content-loader";

const CardSkeleton: React.FC = (props) => {
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height={60}
      // Using a flexible viewBox so it fits into grid columns
      viewBox="0 0 300 60"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      preserveAspectRatio="none"
      {...props}
    >
      {/* Icon Circle */}
      <rect x="0" y="5" rx="25" ry="25" width="50" height="50" />
      
      {/* Label Line */}
      <rect x="65" y="10" rx="3" ry="3" width="120" height="10" />
      
      {/* Value Line */}
      <rect x="65" y="30" rx="3" ry="3" width="80" height="20" />
    </ContentLoader>
  );
};

export default CardSkeleton;