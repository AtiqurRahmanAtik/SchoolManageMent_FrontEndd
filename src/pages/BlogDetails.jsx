import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Tag, LayoutDashboard } from 'lucide-react';
import { useBlogs } from '../Hook/useBlogs'; // Adjust path if necessary

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogDetails, loading, error, fetchBlogById } = useBlogs();

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#f9fafb]">
        <span className="loading loading-spinner loading-lg text-[#f38a1d]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#f9fafb]">
        <p className="text-red-500 font-medium mb-4">Failed to load blog: {error}</p>
        <button onClick={() => navigate(-1)} className="btn bg-[#f38a1d] hover:bg-[#d97715] border-none text-white">
          Go Back
        </button>
      </div>
    );
  }

  if (!blogDetails) {
    return null;
  }

  const displayDate = blogDetails.createdAt 
    ? new Date(blogDetails.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "Recent";

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-[#f38a1d] mb-8 font-medium transition-colors uppercase tracking-wide text-sm"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Blogs
        </button>

        {/* Content Container */}
        <div className="bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Banner Image */}
          {blogDetails.image && (
            <div className="w-full h-[300px] md:h-[450px] relative bg-gray-100">
              <img 
                src={blogDetails.image} 
                alt={blogDetails.blogHeadline} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-6 md:p-10 lg:p-14">
            
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-6 text-[#f38a1d] text-xs font-bold uppercase tracking-wide mb-6">
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {displayDate}
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                {blogDetails.blogWriter}
              </div>
              <div className="flex items-center">
                <LayoutDashboard size={16} className="mr-2" />
                {blogDetails.department}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#333] font-serif mb-8 leading-tight">
              {blogDetails.blogHeadline}
            </h1>

            <hr className="border-gray-100 mb-8" />

            {/* Description Body */}
            <div className="prose max-w-none text-gray-600 leading-loose text-lg whitespace-pre-line mb-10">
              {blogDetails.description}
            </div>

            {/* Tags Footer */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <Tag size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tags:</span>
              <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium">
                {blogDetails.tag}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;