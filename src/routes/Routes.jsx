import { createBrowserRouter, Navigate } from "react-router-dom";

// --- Layouts & Roots ---
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot"; // Dashboard Layout (Sidebar/Header)

// --- Public Pages ---


// --- Dashboard Pages ---
import Home from "../pages/Dashboard/Home"; // Main Dashboard view
// (You will need to create the following components in your pages folder)













import Teachers from "../pages/Dashboard/Teachers";
import Section from "../pages/Dashboard/Section";
import Classes from "../pages/Dashboard/Classes";
import Admissions from "../pages/Dashboard/Admissions";
import AttendanceReport from "../pages/Dashboard/AttendanceReport";
import Attendance from "../pages/Dashboard/Attendance";
import Calendar from "../pages/Dashboard/Calendar";

import Subjects from "../pages/Dashboard/Subjects";


import Exams from "../pages/Dashboard/Exams";
import Results from "../pages/Dashboard/Results";
import Routine from "../pages/Dashboard/Routine";
import Salary from "../pages/Dashboard/Salary";
import Notices from "../pages/Dashboard/Notices";

import Students from "../pages/Dashboard/Students";
import Login from "../pages/Login";
import Register from "../pages/Register";

import HomePage from "../pages/HomePage";
import Error404 from "../pages/Error404";

import Employee from "../pages/Dashboard/Employee";

import EmployeeRole from "../pages/Dashboard/EmployeeRole";
import EmployeeList from "../pages/Dashboard/EmployeeList";

import StudentsAttendanceRecord from "../pages/Dashboard/StudentsAttendanceRecord";
import EmployeeAttendance from "../pages/Dashboard/EmployeeAttendance";
import StudentAttendancePage from "../pages/Dashboard/StudentAttendance";
import EmployeeAttendanceRecord from "../pages/Dashboard/EmployeeAttendanceRecord";
import ClassTime from "../pages/Dashboard/ClassTime";
import Day from "../pages/Dashboard/Day";
import Grade from "../pages/Dashboard/Grade";
import AddMarks from "../pages/Dashboard/AddMarks";
import StudentIDCard from "../pages/Dashboard/StudentIDCard";
import EmployeeIDCard from "../pages/Dashboard/EmployeeIDCard";
import InstituteProfile from "../pages/Dashboard/InstituteProfile";

import Banner from "../pages/Dashboard/Banner";
import OurActivities from "../pages/Dashboard/OurActivities";
import ParentsReview from "../pages/Dashboard/ParentsReview";
import Events from "../pages/Dashboard/Events";
import ResentNotice from "../pages/Dashboard/ResentNotice";
import Notice from "../pages/Notice";
import NoticeDetails from "../pages/NoticeDetails";
import Blog from "../pages/Blog";
import Blogs from "../pages/Dashboard/Blogs";
import BlogDetails from "../pages/BlogDetails";
import Contact from "../pages/Contact";
import Contacts from "../pages/Dashboard/Contacts";
import Teacher from "../pages/Teacher";

import About from "../pages/About";
import AboutUs from "../pages/Dashboard/AboutUs";





export const router = createBrowserRouter([
  // ==========================================
  // PUBLIC ROUTES (Website Front-End)
  // ==========================================
 {
  path: "/",
  element: <Root />,
  errorElement: <Error404 />,
  children: [
    {
      path: "/", 
      element: <HomePage />, 
    },
    {
      path: "/teacher",
      element: <Teacher/>
    },
        
        {
          path: "/about", // This matches "/about"
          element: <About />, 
        },
          {
          path: "/notice", // This matches "/about"
          element: <Notice />, 
        },
         {
          path: "/notice-details/:id", // This matches "/about"
          element: <NoticeDetails />, 
        },
        {
          path:"blog",
          element: <Blog/>
        },
         {
          path:"/blog-details/:id",
          element: <BlogDetails/>
        },
        {
          path:"contact",
          element: <Contact/>
        },
          
       
     
      
          
        
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "register",
      element: <Register />,
    },
  ],
},
  // ==========================================
  // PRIVATE ROUTES (Admin/School Dashboard)
  // ==========================================
  {
    // Pathless layout route to wrap everything in Aroot (Sidebar/Header)
    element: <Aroot />,
    errorElement: <Error404 />,
    children: [
      {
        path: "dashboard",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
  path: "website-management", // Parent route
  children: [
    {
      path: "resentNotice", // Maps to /website-management/banner
      element: (
        <PrivateRoot>
          <ResentNotice />
        </PrivateRoot>
      ),
    },
    {
      path: "banner", // Maps to /website-management/banner
      element: (
        <PrivateRoot>
          <Banner />
        </PrivateRoot>
      ),
    },
    {
      path: "our-activities", 
      element: (
        <PrivateRoot>
          <OurActivities />
        </PrivateRoot>
      ),
    },
     {
      path: "parents-review", 
      element: (
        <PrivateRoot>
          <ParentsReview />
        </PrivateRoot>
      ),
    },
      {
      path: "events", 
      element: (
        <PrivateRoot>
          < Events/>
        </PrivateRoot>
      ),
    },
    {
      path: "aboutUs", 
      element: (
        <PrivateRoot>
          < AboutUs/>
        </PrivateRoot>
      ),
    },
    {
      path: "blogs", 
      element: (
        <PrivateRoot>
          < Blogs/>
        </PrivateRoot>
      ),
    },
    {
      path: "contacts", 
      element: (
        <PrivateRoot>
          < Contacts/>
        </PrivateRoot>
      ),
    },
    
  ],
},
      {
        path: "/instituteProfile",
        element : <PrivateRoot><InstituteProfile/> </PrivateRoot>
      },
      {
        path: "admissions",
        element: <PrivateRoot><Admissions /></PrivateRoot>,
      },
      {
        path: "students",
        element: <PrivateRoot><Students /></PrivateRoot>,
      },
      
      // {
      //   path: "teachers",
      //   element: <PrivateRoot><Teachers /></PrivateRoot>,
      // },

     

     
// --- Employee Routes ---
{
  path: "employee",
  children: [
    {
      index: true, 
      element: (
        <PrivateRoot>
          <Employee />
        </PrivateRoot>
      ),
    },
    {
      path: "role", 
      element: (
        <PrivateRoot>
          <EmployeeRole />
        </PrivateRoot>
      ),
    },
    {
      path: "list", 
      element: (
        <PrivateRoot>
          <EmployeeList />
        </PrivateRoot>
      ),
    },
  ],
},




  // {
  //   path: "employee",
  //   element: (
  //     <PrivateRoot>
  //       <Employee />
  //     </PrivateRoot>
  //   ),
  // },
  // {
  //   path: "employee-role",
  //   element: (
  //     <PrivateRoot>
  //       <EmployeeRole />
  //     </PrivateRoot>
  //   ),
  // },
  


      // {
      //   path: "employee",
      //   element: <PrivateRoot><Employee /></PrivateRoot>,
      // },
      //  {
      //   path: "employee-role",
      //   element: <PrivateRoot><EmployeeRole /></PrivateRoot>,
      // },
      {
        path: "classes",
        element: <PrivateRoot><Classes /></PrivateRoot>,
      },
      {
        path: "section",
        element: <PrivateRoot><Section /></PrivateRoot>,
      },
      {
        path: "subjects",
        element: <PrivateRoot><Subjects /></PrivateRoot>,
      },



// --- Attendance Routes ---
{
  path: "attendance",
  children: [
    {
     
      path: "student", 
      element: (
        <PrivateRoot>
          <StudentAttendancePage />
        </PrivateRoot>
      ),
    },
    {
     
      path: "employee", 
      element: (
        <PrivateRoot>
          <EmployeeAttendance />
        </PrivateRoot>
      ),
    },
    
    
  ],
},
      



{
  path: "attendanceReport",
  children: [


     {
     
      path: "studentRecord", 
      element: (
        <PrivateRoot>
          <StudentsAttendanceRecord />
        </PrivateRoot>
      ),
    },
    
     {
     
      path: "employeeRecord", 
      element: (
        <PrivateRoot>
          <EmployeeAttendanceRecord />
        </PrivateRoot>
      ),
    },
    
  ],
},
      
     
      {
        path: "exams",
        element: <PrivateRoot><Exams /></PrivateRoot>,
      },
      {
        path: "addMarks",
        element: <PrivateRoot><AddMarks /></PrivateRoot>,
      },
       {
        path: "results",
        element: <PrivateRoot><Results /></PrivateRoot>,
      },
      {
        path: "routine",
        element: <PrivateRoot><Routine /></PrivateRoot>,
      },
      {
        path: "salary",
        element: <PrivateRoot><Salary /></PrivateRoot>,
      },
      {
        path: "notices",
        element: <PrivateRoot><Notices /></PrivateRoot>,
      },
      {
        path: "calendar",
        element: <PrivateRoot><Calendar /></PrivateRoot>,
      },

{
  path: "id-card",
  children: [
    {
      path: "student", // Access via /id-card/student
      element: (
        <PrivateRoot>
          <StudentIDCard />
        </PrivateRoot>
      ),
    },
    {
      path: "employee", // Access via /id-card/employee
      element: (
        <PrivateRoot>
          <EmployeeIDCard />
        </PrivateRoot>
      ),
    },
  ],
},
     

      {
  path: "settings",
  children: [


     {
     
      path: "classTime", 
      element: (
        <PrivateRoot>
          <ClassTime />
        </PrivateRoot>
      ),
    },
    
     {
     
      path: "day", 
      element: (
        <PrivateRoot>
          <Day />
        </PrivateRoot>
      ),
    },
     {
     
      path: "grade", 
      element: (
        <PrivateRoot>
          <Grade />
        </PrivateRoot>
      ),
    },

    
  ],
},
    
      // --- Logout Route ---
      {
        path: "logout",
        element: <PrivateRoot><Navigate to="/" replace /></PrivateRoot>,
      },
    ],
  },
]);