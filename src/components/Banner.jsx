import React, { useEffect, useState } from 'react';
import { useBanners } from '../Hook/useBanners'; // Adjust the import path as necessary

const Banner = () => {
  const { banners, fetchAllBanners, loading } = useBanners();
  const [animate, setAnimate] = useState(false);

  // Fetch banner data on component mount
  useEffect(() => {
    fetchAllBanners();
  }, [fetchAllBanners]);

  // Trigger text animation when banner data is loaded
  useEffect(() => {
    if (!loading) {
      // Reset animation state briefly to re-trigger transition
      setAnimate(false);
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    }
  }, [banners, loading]);

  // Use the first banner from the API, or fallback to default placeholder values
  const currentBanner = banners && banners.length > 0 ? banners[0] : null;
  const bgImage = currentBanner?.image || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2000&auto=format&fit=crop";
  const fullHeadline = currentBanner?.headLine || "BEST KINDERGARTEN FOR YOUR KIDS";

  // Dynamically split the headline into parts to maintain the original UI structure & colors
  const words = fullHeadline.trim().split(" ");
  const midPoint = Math.ceil(words.length / 2);
  
  const topText1 = words[0] || "";
  const topText2 = words.slice(1, midPoint).join(" ") || "";
  const bottomText1 = words.slice(midPoint, midPoint + 1).join(" ") || "";
  const bottomText2 = words.slice(midPoint + 1).join(" ") || "";

  // Inline styling for the animation (Slide up and fade in)
  const animationStyle = {
    opacity: animate ? 1 : 0,
    transform: animate ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out'
  };


  
  return (
    <div 
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Light transparent overlay to ensure text readability against any background */}
      <div className="absolute inset-0 bg-white/20"></div>

      <div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-4"
        style={animationStyle} // Applying the dynamic animation here
      >
        
        {/* Top Headline Line (With white background box) */}
        <div className="bg-white/85 px-6 py-2 md:px-8 md:py-3 mb-2 shadow-sm">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase font-serif tracking-wide">
            <span className="text-purple-800 mr-3 md:mr-4">{topText1}</span>
            <span className="text-orange-500">{topText2}</span>
          </h1>
        </div>

        {/* Bottom Headline Line (No background) */}
        {(bottomText1 || bottomText2) && (
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase font-serif tracking-wide mt-2 drop-shadow-md">
            <span className="text-cyan-500 mr-3 md:mr-4">{bottomText1}</span>
            <span className="text-purple-800">{bottomText2}</span>
          </h2>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button className="bg-purple-800 hover:bg-purple-900 text-white font-semibold py-3 px-8 text-sm md:text-base uppercase tracking-wider transition duration-300 shadow-md transform hover:scale-105">
            Contact Us Now
          </button>
        
        </div>
        
      </div>
    </div>
  );
};

export default Banner;