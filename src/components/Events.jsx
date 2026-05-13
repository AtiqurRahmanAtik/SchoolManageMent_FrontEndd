import React, { useEffect, useRef } from "react";
import { useEvents } from "../Hook/useEvents"; // Adjust the import path as necessary

// Alternating colors for the event cards based on the design
const bgColors = ["bg-[#25a9e0]", "bg-[#8e24aa]", "bg-[#f57c00]"];

const Events = () => {
  const { events, loading, error, fetchAllEvents } = useEvents();
  const scrollRef = useRef(null);

  useEffect(() => {
    // Fetch initial events (page 1, limit 10)
    fetchAllEvents(1, 10);
  }, [fetchAllEvents]);

  // Handle Carousel Scrolling
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll by approximately one card width plus gap
      const scrollAmount = direction === "left" ? -360 : 360; 
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-[#1a82c4]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 flex justify-center items-center text-red-500 font-medium">
        Failed to load events: {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white relative w-full max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-8">
      
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a82c4] font-serif uppercase tracking-wide">
          Events
        </h2>
      </div>

      {/* Carousel Container Wrapper */}
      <div className="relative flex items-center group">
        
        {/* Left Arrow Navigation */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-20 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-[0_3px_10px_rgb(0,0,0,0.15)] hover:bg-gray-50 focus:outline-none transition-colors rounded-full"
          aria-label="Previous events"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Scrollable Carousel Area */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 md:gap-8 snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-4 md:px-10 w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((evt, index) => {
            // Assign a repeating background color based on the index
            const bgColor = bgColors[index % bgColors.length];

            return (
              <div
                key={evt._id}
                className="group relative flex flex-col items-center bg-[#f9f9f9] overflow-hidden rounded-sm min-w-[280px] sm:min-w-[320px] md:min-w-[340px] flex-shrink-0 snap-start shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Event Image */}
                <div className="w-full h-[300px] flex justify-center items-end bg-gray-100">
                  <img
                    src={evt.eventImage}
                    alt={evt.eventName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                  />
                </div>

                {/* Animated Info Box (Matches the requested Teacher UI style) */}
                <div
                  className={`absolute bottom-0 w-full ${bgColor} text-white flex flex-col items-center justify-start transition-all duration-500 ease-in-out h-14 group-hover:h-[160px] pt-4 rounded-t-md`}
                >
                  {/* Default visible title */}
                  <h4 className="text-[17px] font-bold tracking-wide text-center px-4 truncate w-full">
                    {evt.eventName}
                  </h4>

                  {/* Hidden content that fades in and expands on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col items-center mt-2 px-4 w-full">
                    <span className="text-sm font-semibold text-white/90 mb-2 border-b border-white/30 pb-1">
                      {evt.date}
                    </span>
                    <p className="text-sm font-medium text-center text-white/95 line-clamp-3 w-full leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Navigation */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-20 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-[0_3px_10px_rgb(0,0,0,0.15)] hover:bg-gray-50 focus:outline-none transition-colors rounded-full"
          aria-label="Next events"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      
      {/* Utility style to hide scrollbar for Webkit browsers */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
      
    </section>
  );
};

export default Events;