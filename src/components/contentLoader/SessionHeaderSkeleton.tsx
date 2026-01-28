import ContentLoader from "react-content-loader";

const SessionHeaderSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    {/* Top Row: Status and Room */}
    <div className="flex justify-between items-center mb-6">
      <ContentLoader 
        speed={2}
        width={300}
        height={40}
        viewBox="0 0 300 40"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="0" y="5" rx="4" ry="4" width="100" height="30" /> {/* Type */}
        <rect x="110" y="8" rx="10" ry="10" width="80" height="24" /> {/* Status Badge */}
      </ContentLoader>

      <ContentLoader 
        speed={2}
        width={100}
        height={40}
        viewBox="0 0 100 40"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="0" y="0" rx="8" ry="8" width="100" height="40" /> {/* Room Badge */}
      </ContentLoader>
    </div>

    {/* Bottom Grid: 4 Columns (Date, Time, Instructor, Device) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <ContentLoader 
          key={i}
          speed={2}
          width="100%"
          height={50}
          viewBox="0 0 200 50"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="3" ry="3" width="60" height="10" /> {/* Label */}
          <circle cx="10" cy="30" r="8" /> {/* Icon */}
          <rect x="25" y="22" rx="3" ry="3" width="120" height="16" /> {/* Value */}
        </ContentLoader>
      ))}
    </div>
  </div>
);

export default SessionHeaderSkeleton;