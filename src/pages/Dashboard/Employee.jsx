import React, { useState, useEffect } from "react";
import useEmployees from "../../Hook/useEmployees"; // Adjust the import path as needed
import useEmployeeRole from "../../Hook/useEmployeeRole"; // Adjust the import path for the role hook

// FormField Component
const FormField = ({ label, name, type = "text", required, placeholder, options, colSpan = 1, formData, handleChange, loadingRoles }) => (
  <div className={`w-full ${colSpan === 3 ? "md:col-span-3" : "md:col-span-1"}`}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    
    {type === "select" ? (
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#66cc00] focus:border-[#66cc00] text-gray-700 bg-white appearance-none transition-colors"
        >
          <option value="" disabled className="text-gray-400">
            {loadingRoles && name === "employeeRole" ? "Loading..." : "Select..."}
          </option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    ) : type === "file" ? (
      // Replaced the custom file wrapper with a native styled input file type
      <input
        type="file"
        name={name}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#66cc00] focus:border-[#66cc00] text-gray-700 bg-white transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#66cc00] file:text-white hover:file:bg-[#5bb800] cursor-pointer"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#66cc00] focus:border-[#66cc00] text-gray-700 bg-white placeholder-gray-300 transition-colors"
      />
    )}
  </div>
);


const Employee = () => {
  const { createEmployee, loading: submitting, error } = useEmployees();
  
  // Integrate Employee Role Hook
  const { employeeRoles, getAllEmployeeRoles, loading: loadingRoles } = useEmployeeRole();

  // Fetch roles on component mount
  useEffect(() => {
    if (getAllEmployeeRoles) {
      // Fetching with a higher limit to ensure all roles are loaded for the dropdown
      getAllEmployeeRoles(1, 100);
    }
  }, [getAllEmployeeRoles]);

  // Format roles for the dropdown safely
  const roleOptions = Array.isArray(employeeRoles) 
    ? employeeRoles.map(role => 
        typeof role === 'string' 
          ? role 
          : (role.roleName || role.name || role.employeeRole || role.title || "Unknown Role")
      ) 
    : [];

  const [formData, setFormData] = useState({
    employeeName: "",
    mobileNo: "",
    employeeRole: "",
    photo: "", 
    dateOfJoining: "",
    monthlySalary: "",
    fatherHusbandName: "",
    gender: "",
    experience: "",
    nationalId: "",
    religion: "",
    emailAddress: "",
    education: "",
    bloodGroup: "",
    dateOfBirth: "",
    address: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Safely handle file inputs so they update the state properly
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleReset = () => {
    setFormData({
      employeeName: "",
      mobileNo: "",
      employeeRole: "",
      photo: "",
      dateOfJoining: "",
      monthlySalary: "",
      fatherHusbandName: "",
      gender: "",
      experience: "",
      nationalId: "",
      religion: "",
      emailAddress: "",
      education: "",
      bloodGroup: "",
      dateOfBirth: "",
      address: "",
    });
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await createEmployee(formData);
      setSuccessMessage("Employee created successfully!");
      handleReset(); // Clear form on success
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-8 flex justify-center font-sans">
      <div className="w-full max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Registration</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter the details below to enroll a new employee into the system.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium flex items-center"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>{error}</div>}
        {successMessage && <div className="mb-6 p-4 bg-green-50 border border-[#66cc00] text-green-700 rounded-md text-sm font-medium flex items-center"><svg className="w-5 h-5 mr-2 text-[#66cc00]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">1</span>
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>
            
            <div className="border border-gray-100 bg-gray-50/30 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
              <FormField formData={formData} handleChange={handleChange} label="Employee Name" name="employeeName" required placeholder="Full Name" />
              <FormField formData={formData} handleChange={handleChange} label="Mobile No / WhatsApp" name="mobileNo" required placeholder="e.g +44xxxxxxxxxx" />
              
              <FormField 
                formData={formData} 
                handleChange={handleChange} 
                loadingRoles={loadingRoles}
                label="Employee Role" 
                name="employeeRole" 
                type="select" 
                required 
                options={roleOptions} 
              />
              
              {/* Using proper file input field type */}
              <FormField formData={formData} handleChange={handleChange} label="Photo" name="photo" type="input" required />
              
              {/* MOVED GENDER HERE */}
              <FormField formData={formData} handleChange={handleChange} label="Gender" name="gender" type="select" options={["Male", "Female", "Other"]} required />
              
              <FormField formData={formData} handleChange={handleChange} label="Date of Joining" name="dateOfJoining" type="date" required />
              <FormField formData={formData} handleChange={handleChange} label="Monthly Salary" name="monthlySalary" required placeholder="0" type="number" />
            </div>
          </div>

          {/* Section 2: Other Information */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">2</span>
              <h3 className="text-lg font-semibold text-gray-800">Other Information</h3>
            </div>

            <div className="border border-gray-100 bg-gray-50/30 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
              <FormField formData={formData} handleChange={handleChange} label="Father / Husband Name" name="fatherHusbandName" placeholder="Full Name" />
              {/* GENDER REMOVED FROM HERE */}
              <FormField formData={formData} handleChange={handleChange} label="Experience" name="experience" placeholder="e.g. 2 Years" />
              
              <FormField formData={formData} handleChange={handleChange} label="National ID" name="nationalId" placeholder="ID Number" />
              <FormField formData={formData} handleChange={handleChange} label="Religion" name="religion" type="select" options={["Islam", "Hinduism", "Christianity", "Buddhism", "Other"]} />
              <FormField formData={formData} handleChange={handleChange} label="Email Address" name="emailAddress" type="email" placeholder="example@email.com" />
              
              <FormField formData={formData} handleChange={handleChange} label="Education" name="education" placeholder="Highest Degree" />
              <FormField formData={formData} handleChange={handleChange} label="Blood Group" name="bloodGroup" type="select" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
              <FormField formData={formData} handleChange={handleChange} label="Date of Birth" name="dateOfBirth" type="date" />
              
              <FormField formData={formData} handleChange={handleChange} label="Home Address" name="address" placeholder="Complete Home Address" colSpan={3} />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-[#66cc00] hover:bg-[#5bb800] text-white rounded-md font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : (
                "Save Employee"
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Employee;