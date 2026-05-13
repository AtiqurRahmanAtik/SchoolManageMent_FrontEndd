import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react'; // Make sure you have lucide-react installed
import { useRecentNotices } from '../Hook/useRecentNotices'; // Adjust path if necessary

const Notice = () => {
  const { recentNotices, loading, error, fetchAllRecentNotices } = useRecentNotices();

  useEffect(() => {
    // Fetch a generous amount of notices for the list
    fetchAllRecentNotices(1, 50);
  }, [fetchAllRecentNotices]);

  return (
    <div className="w-full bg-[#f4f6f8] py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a82c4] uppercase tracking-wide">
            School Notice
          </h2>
        </div>

        {/* Loading State */}
        {loading && recentNotices?.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-[#1a82c4]"></span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 font-medium py-10">
            Failed to load notices: {error}
          </div>
        )}

        {/* Notices List Area */}
        {!loading && !error && recentNotices && recentNotices?.length > 0 && (
          <div className="flex flex-col gap-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {recentNotices.map((notice) => (
              <Link 
                to={`/notice-details/${notice._id}`} 
                key={notice._id}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                {/* Notice Title - Underlined like the image */}
                <h3 className="text-lg md:text-[19px] font-semibold text-black leading-snug mb-3 hover:text-[#1a82c4] transition-colors underline underline-offset-4 decoration-black/80">
                  {notice.noticeTitle}
                </h3>
                
                {/* Date Row */}
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar size={16} className="mr-2 opacity-70" />
                  <span>{notice.date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recentNotices?.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-200">
            No school notices available at this time.
          </div>
        )}

      </div>

      {/* Optional CSS to style the scrollbar to match clean UI aesthetics */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `}} />
    </div>
  );
};

export default Notice;