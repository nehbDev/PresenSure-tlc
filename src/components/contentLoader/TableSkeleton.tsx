import React from "react";
import ContentLoader from "react-content-loader";

interface TableSkeletonProps {
  width?: number | string;
  height?: number;
  style?: React.CSSProperties;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  width = "100%",
  height = 50,
  style,
}) => {
  return (
    <ContentLoader
      speed={2}
      width={width}
      height={height}
      // Using a percentage-based viewBox allows it to scale responsively
      viewBox="0 0 100% 50"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      style={{ marginBottom: 10, width: "100%", ...style }}
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" rx="4" ry="4" width="100%" height={height} />
    </ContentLoader>
  );
};

export default TableSkeleton;