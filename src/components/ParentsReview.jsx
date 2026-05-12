import React, { useState, useEffect } from 'react';
import { useParentsReviews } from '../Hook/useParentsReviews'; // Adjust the import path as necessary

const ParentsReview = () => {
    // 1. Initialize the custom hook
    const { 
        parentsReviews, 
        loading, 
        error, 
        fetchAllParentsReviews 
    } = useParentsReviews();

    // 2. Local state for the carousel
    const [currentIndex, setCurrentIndex] = useState(0);

    // 3. Fetch data on component mount
    useEffect(() => {
        // Fetching the first page, limiting to 5 reviews for the carousel
        fetchAllParentsReviews(1, 5); 
    }, [fetchAllParentsReviews]);

    // 4. Auto-play carousel logic (changes review every 5 seconds)
    useEffect(() => {
        if (!parentsReviews || parentsReviews.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === parentsReviews.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [parentsReviews]);

    // 5. Conditional Rendering for Loading and Error States
    if (loading) {
        return (
            <div className="w-full bg-[#f2f8fa] py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0c2b5e]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-[#f2f8fa] py-20 flex justify-center items-center">
                <p className="text-red-500 font-medium">Failed to load reviews: {error}</p>
            </div>
        );
    }

    if (!parentsReviews || parentsReviews.length === 0) {
        return null; // Or return a fallback UI if no reviews exist
    }

    // 6. Get the current active review
    const activeReview = parentsReviews[currentIndex];

    // Safe fallbacks in case your API uses slightly different key names
    const name =  activeReview?.parentsName || "Anonymous";
    const role = activeReview?.role || "Parent";
    const reviewText = activeReview?.parentsReview || "";
    const image = activeReview?.parentsImage || activeReview?.photoUrl || "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop";


    
    return (
        <div className="relative w-full bg-[#f2f8fa] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500">
            
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full opacity-60 translate-x-1/3 -translate-y-1/3"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header Section */}
                <div className="mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0c2b5e] font-serif tracking-tight lg:pl-12">
                        What Parents Says About Us
                    </h2>
                </div>

                {/* Content Layout */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20">
                    
                    {/* Left Column: Image Area */}
                    <div className="w-full md:w-5/12 flex justify-center lg:justify-end">
                        {/* Outer White Frame */}
                        <div className="bg-white p-4 rounded-[2rem] shadow-sm w-full max-w-sm transition-transform duration-500 hover:scale-105">
                            {/* Inner Image */}
                            <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-200">
                                <img 
                                    src={image} 
                                    alt={`${name}'s Review`} 
                                    className="w-full h-full object-cover transition-opacity duration-500"
                                />
                                {/* Overlay gradient to match the slightly muted tone in the design */}
                                <div className="absolute inset-0 bg-black/10"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Text Area */}
                    <div className="w-full md:w-6/12 flex flex-col justify-center px-4 md:px-0">
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed md:leading-loose mb-10 font-medium max-w-lg transition-opacity duration-500">
                            "{reviewText}"
                        </p>
                        
                        <div>
                            <h4 className="text-xl md:text-2xl font-bold text-[#6a87a6] font-serif">
                                {name}
                            </h4>
                            <p className="text-lg font-bold text-[#6a87a6] mt-1 font-serif">
                                {role}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Dynamic Carousel Indicators */}
                {parentsReviews.length > 1 && (
                    <div className="flex justify-center items-center mt-16 gap-2">
                        {parentsReviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to review ${index + 1}`}
                                className={`h-[3px] rounded-full cursor-pointer transition-all duration-300 ${
                                    currentIndex === index 
                                    ? "w-8 bg-[#0c2b5e]" 
                                    : "w-6 bg-[#b9e0f9] hover:bg-[#6a87a6]"
                                }`}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ParentsReview;