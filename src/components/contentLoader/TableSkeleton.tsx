import React from "react";
import ContentLoader from "react-content-loader";

interface TableSkeletonProps {
  width?: number | string;
  height?: number;
  style?: React.CSSProperties;
}

/**
 * Simple single-line rectangular row skeleton for tables.
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  width = "100%",
  height = 40,
  style,
}) => {
  return (
    <ContentLoader
      speed={2}
      width={width}
      height={height}
      viewBox={`0 0 800 ${height}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      style={{ marginBottom: 10, width, ...style }}
      preserveAspectRatio="none"
    >
      {/* One big rectangle for the full row width */}
      <rect x="0" y="0" rx="4" ry="4" width="800" height={height} />
    </ContentLoader>
  );
};

export default TableSkeleton;
