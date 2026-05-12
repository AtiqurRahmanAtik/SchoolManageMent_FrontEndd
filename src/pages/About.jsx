import React, { useEffect } from 'react';
import { useAboutUs } from '../Hook/useAboutUs'; // Adjust path if necessary

const AboutUs = () => {
    const { aboutUsList, loading, error, fetchAllAboutUs } = useAboutUs();

    useEffect(() => {
        fetchAllAboutUs(1, 1); // Fetch the first item to display
    }, [fetchAllAboutUs]);

    if (loading) {
        return <div className="text-center my-10">Loading About Us...</div>;
    }

    if (error) {
        return <div className="text-center my-10 text-red-500">Error: {error}</div>;
    }

    const content = aboutUsList && aboutUsList.length > 0 ? aboutUsList[0] : null;

    if (!content) {
         return <div className="text-center my-10 text-gray-500">No About Us content found.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                
                {/* Text Content Side */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">
                        ABOUT US
                    </p>
                    
                    {/* Assuming the headline from backend might be stored as a single string. 
                      If it matches the image "Welcome to Our university", we might style it directly.
                      Otherwise, we just output the headline provided by the API.
                    */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                        {content.headline || "Welcome to Our university"}
                    </h2>
                    
                    <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                        {content.description}
                    </p>
                    
                    <div>
                        <button className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300 uppercase tracking-wider text-sm">
                            Read More
                        </button>
                    </div>
                </div>

                {/* Image/Video Side */}
                <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl p-4 bg-white">
                        <img 
                            src={content.image} 
                            alt={content.headline || "About Us"} 
                            className="w-full h-auto object-cover rounded-xl"
                            style={{ maxHeight: '500px' }}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=About+Us+Image"; }}
                        />
                        
                        {/* Play Button Overlay (Based on design) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-orange-400 hover:bg-orange-500 text-white rounded-full p-4 shadow-lg transition duration-300 transform hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutUs;