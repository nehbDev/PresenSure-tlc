import React from "react";
import ContentLoader from "react-content-loader";

const CardSkeleton: React.FC = (props) => {
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height={55} // Matches the approximate content height
      viewBox="0 0 300 55"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      preserveAspectRatio="xMinYMid meet"
      {...props}
    >
      {/* Square placeholder for the Icon */}
      <rect x="0" y="2" rx="6" ry="6" width="50" height="50" />

      {/* Thin line for the Label (e.g., "Total Students") */}
      <rect x="65" y="6" rx="3" ry="3" width="140" height="10" />

      {/* Thicker line for the Value (e.g., "1,204") */}
      <rect x="65" y="26" rx="3" ry="3" width="80" height="24" />
    </ContentLoader>
  );
};

export default CardSkeleton;