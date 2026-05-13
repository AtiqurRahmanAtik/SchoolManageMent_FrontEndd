import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlogs } from '../Hook/useBlogs'; // Adjust the import path as necessary

const Blog = () => {
  const { blogs, loading, error, fetchAllBlogs } = useBlogs();

  useEffect(() => {
    // Fetch a generous amount to fill the grid (e.g., page 1, 9 items)
    fetchAllBlogs(1, 9);
  }, [fetchAllBlogs]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#f9fafb]">
        <span className="loading loading-spinner loading-lg text-[#f38a1d]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 flex justify-center items-center text-red-500 font-medium">
        Failed to load blogs: {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f9fafb] py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <span className="text-gray-500 uppercase tracking-widest text-sm font-semibold block mb-2">
              Top Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a82c4] font-serif">
              Blog & News
            </h2>
          </div>

          {/* Carousel/Pagination Arrows (Visual match to UI) */}
          <div className="flex gap-3">
            <button className="bg-[#333333] text-white p-3 rounded-full hover:bg-black transition-colors shadow-md">
              <ChevronLeft size={20} />
            </button>
            <button className="bg-[#333333] text-white p-3 rounded-full hover:bg-black transition-colors shadow-md">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Blog Grid */}
        {blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              // Format a display date from createdAt, or show a fallback
              const displayDate = blog.createdAt 
                ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                : "Recent";

              return (
                <div 
                  key={blog._id} 
                  className="bg-white rounded-md overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Blog Image */}
                  <div className="h-56 w-full relative overflow-hidden bg-gray-200">
                    <img 
                      src={blog.image} 
                      alt={blog.blogHeadline} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=No+Image"; }}
                    />
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-[#f38a1d] text-xs font-bold uppercase tracking-wide mb-4">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1.5" />
                        {displayDate}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare size={14} className="mr-1.5" />
                        {/* Using Tag as a stand-in for categories/comments */}
                        {blog.tag || "General"}
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl md:text-2xl font-bold text-[#333] font-serif mb-3 leading-snug line-clamp-2">
                      {blog.blogHeadline}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {blog.description}
                    </p>

                    {/* Read More Button */}
                    <div className="mt-auto pt-4">
                      <Link 
                        to={`/blog-details/${blog._id}`}
                        className="inline-block bg-[#f38a1d] text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#d97715] transition-colors shadow-sm hover:shadow-md"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            No blogs available at the moment.
          </div>
        )}

      </div>
    </div>
  );
};

export default Blog;