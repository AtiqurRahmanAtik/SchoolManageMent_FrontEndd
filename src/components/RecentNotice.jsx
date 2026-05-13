import React, { useEffect } from 'react';
import Marquee from 'react-fast-marquee'; // npm install react-fast-marquee
import { useRecentNotices } from '../Hook/useRecentNotices'; // Adjust the import path as necessary

const RecentNotice = () => {
  const { recentNotices, loading, error, fetchAllRecentNotices } = useRecentNotices();

  useEffect(() => {
    // Fetch a large limit (e.g., 50) to show all recent notices in the ticker
    fetchAllRecentNotices(1, 50);
  }, [fetchAllRecentNotices]);

  // If there's an error or no notices (and not loading), we can hide the bar or show a fallback
  if (error) {
    return null; 
  }

  return (
    <div className="w-full bg-[#6b21a8] text-white flex items-center shadow-sm relative overflow-hidden h-12">
      
      {/* Static Label on the Left */}
      <div className="bg-white text-black h-full flex items-center px-4 md:px-6 font-semibold text-sm md:text-base whitespace-nowrap z-10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
        Recent Notice
      </div>

      {/* Scrolling Ticker Area */}
      <div className="flex-1 overflow-hidden flex items-center h-full">
        {loading ? (
          <span className="text-sm px-4 text-white/80 animate-pulse">Loading notices...</span>
        ) : recentNotices && recentNotices.length > 0 ? (
          <Marquee 
            speed={50} 
            pauseOnHover={true} 
            gradient={false}
            className="h-full flex items-center"
          >
            <div className="flex items-center pt-1">
              {recentNotices.map((notice, index) => (
                <div key={notice._id || index} className="flex items-center">
                  
                  {/* Notice Content */}
                  <span className="text-sm md:text-base font-medium whitespace-nowrap cursor-pointer hover:underline tracking-wide">
                    {notice.noticeName && `${notice.noticeName}: `}
                    {notice.noticeTitle}
                  </span>

                  {/* Separator - show after every item EXCEPT the very last one (though marquee repeats anyway) */}
                  <span className="mx-6 md:mx-8 font-bold text-white/60">
                    ||
                  </span>
                </div>
              ))}
            </div>
          </Marquee>
        ) : (
          <span className="text-sm px-4 text-white/80">No recent notices available.</span>
        )}
      </div>

    </div>
  );
};

export default RecentNotice;