import React, { useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useEmployees } from '../Hook/useEmployees'; // Adjust the import path as necessary

// We use an array of colors to maintain the design's alternating color pattern
const bgColors = ["bg-[#25a9e0]", "bg-[#8e24aa]", "bg-[#f57c00]"];

const OurTeachers = () => {
  const { employees, fetchAllEmployees, loading, error } = useEmployees();

  // Fetch data on component mount
  useEffect(() => {
    // Fetch a large limit (e.g., 100) to show all teachers
    fetchAllEmployees(1, 100);
  }, [fetchAllEmployees]);

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-800 font-serif mb-4">
            Our Teachers
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 md:w-12 h-[2px] bg-orange-500"></div>
            <h3 className="text-lg md:text-xl font-bold text-orange-500">
              Meet Our Teachers & Office Staff
            </h3>
            <div className="w-8 md:w-12 h-[2px] bg-orange-500"></div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 font-semibold mb-8">
            Failed to load teachers: {error}
          </div>
        )}

        {/* Loading State */}
        {loading && employees.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-lg text-purple-600">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Teachers Grid */}
            {employees?.map((employee, index) => {
              // Assign a repeating background color based on the index
              const bgColor = bgColors[index % bgColors.length];

              return (
                <div 
                  key={employee._id || index} 
                  className="group relative flex flex-col items-center bg-[#f9f9f9] overflow-hidden rounded-sm"
                >
                  {/* Teacher Image */}
                  <div className="w-full h-80 pt-6 flex justify-center items-end">
                    <img 
                      src={employee.photo} 
                      alt={employee.employeeName} 
                      className="h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/600x800?text=No+Photo"; }}
                    />
                  </div>

                  {/* Animated Info Box */}
                  <div 
                    className={`absolute bottom-0 w-full ${bgColor} text-white flex flex-col items-center justify-start transition-all duration-500 ease-in-out h-14 group-hover:h-[120px] pt-4 rounded-t-md`}
                  >
                    <h4 className="text-[17px] font-bold tracking-wide text-center px-2 truncate w-full">
                      {employee.employeeName}
                    </h4>
                    
                    {/* Hidden content that fades in and expands on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col items-center mt-1">
                      <p className="text-sm font-medium mb-3 text-center px-2 truncate w-full">
                        {employee.employeeRole}
                      </p>
                      
                      {/* Social Icons */}
                      <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-gray-200 transition-colors">
                          <Facebook size={16} fill="currentColor" strokeWidth={0} />
                        </a>
                        <a href="#" className="hover:text-gray-200 transition-colors">
                          <Twitter size={16} fill="currentColor" strokeWidth={0} />
                        </a>
                        <a href="#" className="hover:text-gray-200 transition-colors">
                          <Linkedin size={16} fill="currentColor" strokeWidth={0} />
                        </a>
                        {/* Note: Using Instagram as a substitute for Pinterest if using standard Lucide icons */}
                        <a href="#" className="hover:text-gray-200 transition-colors">
                          <Instagram size={16} strokeWidth={2} />
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default OurTeachers;