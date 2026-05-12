import {
  MdDashboard,
  MdOutlinePeople,
  MdOutlinePersonAdd,
  MdOutlineSchool,
  MdOutlineBadge,
  MdOutlineClass,
  MdOutlineMenuBook,
  MdOutlineFactCheck,
  MdOutlineAssessment,
  MdOutlineEditNote,
  MdOutlineEmojiEvents,
  MdOutlineSchedule,
  MdOutlinePayments,
  MdOutlineNotifications,
  MdOutlineCalendarMonth,
  MdOutlineTrendingUp,
  MdLogout
} from "react-icons/md";

const useMenuItems = () => {
  const allItems = [
    { title: "Dashboard", path: "/dashboard", icon: <MdDashboard className="text-xl" /> },

    { 
  title: "WebsiteManagement",
  icon: <MdOutlineSchool className="text-xl" />, 
  list: [
    {
      title: "ResentNotice",
      path: "/website-management/resentNotice", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Banner",
      // FIXED: Changed from "/Banner" to match the nested route
      path: "/website-management/banner", 
      icon: <MdOutlineSchool className="text-xl" />,
    },
     {
      title: "Our Activities",
      path: "/website-management/our-activities", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Parents Review",
      path: "/website-management/parents-review", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Events",
      path: "/website-management/events", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Blogs",
      path: "/website-management/blogs", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
     {
      title: "Contact",
      path: "/website-management/contacts", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
     {
      title: "AboutUs",
      path: "/website-management/aboutUs", // Example of how the next one would look
      icon: <MdOutlineSchool className="text-xl" />,
    },
  ]
}
,

    { title: "Institute Profile", path: "/instituteProfile", icon: <MdOutlinePeople className="text-xl" /> },
     { title: "Admissions", path: "/admissions", icon: <MdOutlinePersonAdd className="text-xl" /> },
    { title: "Students", path: "/students", icon: <MdOutlinePeople className="text-xl" /> },
   

    // { title: "Teachers", path: "/teachers", icon: <MdOutlineSchool className="text-xl" /> },


{
  title: "Employee",
  icon: <MdOutlineSchool className="text-xl" />, 
  list: [
    {
      title: "Employees",
      path: "/employee",
      icon: <MdOutlineSchool className="text-xl" />,
    },
     {
      title: "Employee List",
      path: "/employee/list", 
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Employee Role",
      path: "/employee/role", 
      icon: <MdOutlineSchool className="text-xl" />,
    },
    
  ],
},



    


    { title: "Classes", path: "/classes", icon: <MdOutlineClass className="text-xl" /> },
    { title: "Section", path: "/section", icon: <MdOutlineClass className="text-xl" /> },
    { title: "Subjects", path: "/subjects", icon: <MdOutlineMenuBook className="text-xl" /> },
    
    { 
  title: "Attendance",  
  icon: <MdOutlineFactCheck className="text-xl" />,

  list: [
    { 
      title: "Student Attendance", 
      path: "/attendance/student", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },
   


    { 
      title: "Employee Attendance", 
      path: "/attendance/employee", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },
  ]
},


    { 
  title: "Attendance Report",  
  icon: <MdOutlineFactCheck className="text-xl" />,

  list: [
    { 
      title: "Students Attendance Record", 
      path: "/attendanceReport/studentRecord", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },
   
{ 
      title: "Employee Attendance Record", 
      path: "/attendanceReport/employeeRecord", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },

    
  ]
},






  

    { title: "Exams", path: "/exams", icon: <MdOutlineEditNote className="text-xl" /> },
    { title: "Add Marks", path: "/addMarks", icon: <MdOutlineEmojiEvents className="text-xl" /> },
    { title: "Results", path: "/results", icon: <MdOutlineEmojiEvents className="text-xl" /> },
    { title: "Routine", path: "/routine", icon: <MdOutlineSchedule className="text-xl" /> },
    { title: "Salary", path: "/salary", icon: <MdOutlinePayments className="text-xl" /> },
    { title: "Notices", path: "/notices", icon: <MdOutlineNotifications className="text-xl" /> },
    { title: "Calendar", path: "/calendar", icon: <MdOutlineCalendarMonth className="text-xl" /> },


{
  title: "ID Card",
  icon: <MdOutlineSchool className="text-xl" />, 
  list: [
    {
      title: "Student ID Card",
      path: "/id-card/student", // Corrected to match the child route
      icon: <MdOutlineSchool className="text-xl" />,
    },
    {
      title: "Employee ID Card",
      path: "/id-card/employee", // Corrected to match the child route
      icon: <MdOutlineSchool className="text-xl" />,
    },
  ],
},

   



        { 
  title: "Settings",  
  icon: <MdOutlineFactCheck className="text-xl" />,

  list: [
    { 
      title: "Class Time", 
      path: "/settings/classTime", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },
   
{ 
      title: "Day", 
      path: "/settings/day", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },

    { 
      title: "Grade", 
      path: "/settings/grade", // Correct router path
      icon: <MdOutlineFactCheck className="text-xl" /> 
    },

    
  ]
},
    // I am keeping logout here, but usually, it's handled separately in the UI (like in the top bar)
    { title: "Logout", path: "/logout", icon: <MdLogout className="text-xl" /> },
  ];

  return allItems;
};

export default useMenuItems;