import React from 'react';
import { Outlet } from 'react-router-dom';
import Banner from '../components/Banner';
import OurActivities from '../components/OurActivities';
import OurTeachers from '../components/OurTeachers';
import ParentsReview from '../components/ParentsReview';
import Events from '../components/Events';
import RecentNotice from '../components/RecentNotice';

const HomePage = () => {
  return (
    <div className="home-page-wrapper">
      {/* 
          If you have a Hero Banner or Slider that should 
          only show on the main home page, you can put it here 
          or inside the 'index' route in Routes.jsx.
      */}
      
      {/* This Outlet is where child routes like <AboutUs /> will appear */}
      <RecentNotice/>
      <Banner/>
      <OurActivities/>
      <OurTeachers/>
      <ParentsReview/>
      <Events/>



      <Outlet />
    </div>
  );
};

export default HomePage; // This line fixes the "export not found" error