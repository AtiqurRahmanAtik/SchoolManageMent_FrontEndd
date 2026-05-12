import React from 'react';
import { 
  MdOutlinePeople, 
  MdOutlineSchool, 
  MdOutlineBadge, 
  MdOutlineAssignment,
  MdNotificationsNone,
  MdOutlineCalendarMonth
} from "react-icons/md";

const Home = () => {
  return (
    <div className="p-6 md:p-8 bg-[#f8fafc] min-h-full font-sans">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome to  School Management System</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Total Students</p>
            <h3 className="text-3xl font-bold text-gray-900">5</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <MdOutlinePeople className="text-3xl" />
          </div>
        </div>

        {/* Card 2: Total Teachers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Total Teachers</p>
            <h3 className="text-3xl font-bold text-gray-900">3</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <MdOutlineSchool className="text-3xl" />
          </div>
        </div>

        {/* Card 3: Total Staff */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Total Staff</p>
            <h3 className="text-3xl font-bold text-gray-900">1</h3>
          </div>
          <div className="bg-amber-50 text-amber-500 p-3 rounded-xl">
            <MdOutlineBadge className="text-3xl" />
          </div>
        </div>

        {/* Card 4: Today's Attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Today's Attendance</p>
            <h3 className="text-3xl font-bold text-gray-900">0%</h3>
          </div>
          <div className="bg-slate-100 text-slate-500 p-3 rounded-xl">
            <MdOutlineAssignment className="text-3xl" />
          </div>
        </div>

      </div>

      {/* Bottom Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Notices Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
              <MdNotificationsNone className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Notices</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">No notices yet.</p>
          </div>
        </div>

        {/* Upcoming Events Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
              <MdOutlineCalendarMonth className="text-xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">No upcoming events.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;