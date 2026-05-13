import React, { useState, useEffect } from 'react';
import { useOurActivities } from '../Hook/useOurActivities'; // Adjust path if necessary

// Pre-defined theme colors to maintain the UI design's alternating color pattern
const themeColors = [
  { text: "text-purple-700", bg: "bg-purple-700" },
  { text: "text-sky-500", bg: "bg-sky-500" },
  { text: "text-orange-600", bg: "bg-orange-600" },
  { text: "text-amber-500", bg: "bg-amber-500" },
  { text: "text-rose-600", bg: "bg-rose-600" },
  { text: "text-teal-500", bg: "bg-teal-500" },
];

const OurActivities = () => {
  const {
    ourActivities,
    pagination,
    loading,
    error,
    fetchAllOurActivities,
  } = useOurActivities();

  // State to control how many items are shown. Initially set to 6.
  const [limit, setLimit] = useState(6);
  const [isShowingAll, setIsShowingAll] = useState(false);

  // Fetch data on component mount or when the limit changes
  useEffect(() => {
    fetchAllOurActivities(1, limit);
  }, [fetchAllOurActivities, limit]);

  // Handler for the "View All Services" button
  const handleViewAll = () => {
    // If pagination has totalItems, fetch all of them, otherwise use a high fallback number
    const total = pagination?.totalItems || 100;
    setLimit(total);
    setIsShowingAll(true);
  };

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-800 font-serif mb-4">
            Our Activities
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-[2px] bg-orange-500"></div>
            <h3 className="text-xl md:text-2xl font-semibold text-orange-500">
              Our Best Services For Your Kids
            </h3>
            <div className="w-10 h-[2px] bg-orange-500"></div>
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="text-red-500 text-center mb-8 font-semibold">
            Failed to load activities: {error}
          </div>
        )}

        {/* Loading State - ADDED SAFE CHECK (!ourActivities || ourActivities.length === 0) */}
        {loading && (!ourActivities || ourActivities?.length === 0) ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-lg text-purple-600">Loading...</span>
          </div>
        ) : (
          /* Activities Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {ourActivities?.map((activity, index) => {
              // Get color theme based on index to maintain UI pattern
              const theme = themeColors[index % themeColors?.length];

              return (
                <div key={activity._id} className="flex gap-5 items-start">
                  
                  {/* Hexagon Image Container */}
                  <div 
                    className={`w-24 h-24 flex items-center justify-center flex-shrink-0 text-white  overflow-hidden shadow-sm`}
                  >
                    {/* Counter-rotate the inner div so the image remains straight */}
                    <div className="w-full h-full p-1" style={{ transform: 'rotate(5deg)' }}>
                      <img 
                        src={activity.image} 
                        alt={activity.activitiesName} 
                        className="w-full h-full object-cover"
                        style={{
                           clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                        }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="pt-2">
                    <h4 className={`text-xl font-bold mb-3 ${theme.text}`}>
                      {activity.activitiesName}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button - ADDED OPTIONAL CHAINING (ourActivities?.length) */}
        {!loading && !isShowingAll && (pagination?.totalItems > 6 || ourActivities?.length === 6) && (
          <div className="mt-16 text-center">
            <button 
              onClick={handleViewAll}
              className="bg-purple-800 hover:bg-purple-900 text-white font-bold tracking-wider py-4 px-8 text-sm uppercase transition-colors duration-300 rounded shadow-md"
            >
              View All Services
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OurActivities;