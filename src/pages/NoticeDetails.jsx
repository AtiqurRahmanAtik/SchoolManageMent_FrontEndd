import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react'; // Ensure you have lucide-react installed
import { useRecentNotices } from '../Hook/useRecentNotices'; // Adjust path if necessary

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recentNoticeDetails, loading, error, fetchRecentNoticeById } = useRecentNotices();

  useEffect(() => {
    if (id) {
      fetchRecentNoticeById(id);
    }
  }, [id, fetchRecentNoticeById]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#f4f6f8]">
        <span className="loading loading-spinner loading-lg text-[#1a82c4]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#f4f6f8]">
        <p className="text-red-500 font-medium mb-4">Failed to load notice: {error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!recentNoticeDetails) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-[#1a82c4] mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Notices
        </button>

        {/* Notice Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header / Banner Image (If image exists) */}
          {recentNoticeDetails.image && (
            <div className="w-full h-[300px] md:h-[400px] bg-gray-100 relative">
              <img 
                src={recentNoticeDetails.image} 
                alt={recentNoticeDetails.noticeTitle} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            {/* Meta Information (Name/Category & Date) */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center bg-blue-50 text-[#1a82c4] px-3 py-1 rounded-full font-medium">
                <Tag size={16} className="mr-1.5" />
                {recentNoticeDetails.noticeName || "Notice"}
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1.5 opacity-70" />
                {recentNoticeDetails.date}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {recentNoticeDetails.noticeTitle}
            </h1>

            {/* Divider */}
            <hr className="border-gray-100 mb-8" />

            {/* Description Body */}
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {recentNoticeDetails.description ? (
                recentNoticeDetails.description
              ) : (
                <p className="italic text-gray-400">No additional description provided for this notice.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoticeDetails;