import React, { useState, useEffect, useMemo } from 'react';
import useStudents from '../../Hook/useStudents'; // Adjust the import path as needed
import useSection from '../../Hook/useSection'; // Adjust the import path for your useSection hook
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper component declared strictly OUTSIDE the main function to prevent re-renders
const AdmissionField = ({ label, name, type = 'text', value, onChange, placeholder, required = false, options = [], colSpan = 1 }) => {
  return (
    <div className={`col-span-${colSpan} flex flex-col`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-[#66cc00] focus:outline-none focus:ring-2 focus:ring-[#66cc00]/20 shadow-sm"
          >
            <option value="" disabled>{placeholder || 'Select...'}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
          {/* Custom Select Dropdown Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-[#66cc00] focus:outline-none focus:ring-2 focus:ring-[#66cc00]/20 shadow-sm placeholder:text-gray-400"
        />
      )}
    </div>
  );
};

// Initial state defined outside to easily reuse for reset
const initialFormState = {
  studentName: '',
  registrationNo: '',
  studentClass: '',
  section: '',
  studentPhoto: '', 
  dateOfAdmission: '',
  discountInFee: '',
  mobileNo: '', 
  dateOfBirth: '',
  studentBirthFormId: '',
  gender: '',
  previousSchool: '',
  religion: '',
  bloodGroup: '',
  previousIdBoardRollNo: '',
  additionalNote: '',
  totalSiblings: '',
  address: '',
  fatherName: '',
  fatherNationalId: '',
  fatherOccupation: '',
  fatherEducation: '',
  fatherMobileNo: '',
  fatherIncome: '',
  motherName: '',
  motherNationalId: '',
  motherOccupation: '',
  motherEducation: '',
  motherMobileNo: '',
  motherIncome: '',
};

export default function Admissions() {
  const { createStudent, loading, error } = useStudents();
  
  // Bring in the useSection hook
  const { sections, getSections } = useSection();

  // Fetch sections automatically when the component mounts
  useEffect(() => {
    getSections();
  }, [getSections]);

  // State for form data
  const [formData, setFormData] = useState(initialFormState);

  // Extract unique Class Names from the fetched sections
  const uniqueClasses = useMemo(() => {
    const classSet = new Set(sections.map((s) => s.className));
    return Array.from(classSet).filter(Boolean); // filter(Boolean) removes empty/undefined values
  }, [sections]);

  // Extract Section Names (dynamically filters based on the selected class)
  const availableSections = useMemo(() => {
    let relevantSections = sections;
    // If a class is selected, only show sections that belong to that specific class
    if (formData.studentClass) {
      relevantSections = sections.filter((s) => s.className === formData.studentClass);
    }
    const sectionSet = new Set(relevantSections.map((s) => s.sectionName));
    return Array.from(sectionSet).filter(Boolean);
  }, [sections, formData.studentClass]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If the user changes the class, reset the section field so they don't submit an invalid combination
    if (name === 'studentClass') {
      setFormData((prev) => ({ ...prev, [name]: value, section: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setFormData(initialFormState); // Clear form fields
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      toast.success('Student Admission Successfully Created!');
      handleReset(); // Clear form on success
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(err.message || 'Failed to submit admission form');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow border border-gray-200">
        
        {/* Form Header */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Student Admission Form
          </h1>
          <p className="text-sm text-gray-500">Enter the details below to enroll a new student into the system.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 rounded-r-md shadow-sm text-sm">
            <p className="font-semibold">Submission Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Student Information */}
          <section>
            <div className="flex items-center mb-5">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold">1</span>
              <h2 className="text-lg font-semibold text-gray-800">Student Information</h2>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <AdmissionField label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Full Name" required />
              <AdmissionField label="Registration No" name="registrationNo" value={formData.registrationNo} onChange={handleChange} placeholder="E.g. REG-2026" required />
              
              <AdmissionField 
                label="Select Class" 
                name="studentClass" 
                type="select" 
                value={formData.studentClass} 
                onChange={handleChange} 
                required 
                options={uniqueClasses} 
              />
              
              <AdmissionField 
                label="Section" 
                name="section" 
                type="select" 
                value={formData.section} 
                onChange={handleChange} 
                required 
                options={availableSections} 
              />
              
              <AdmissionField label="Picture Name / URL" name="studentPhoto" type="text" value={formData.studentPhoto} onChange={handleChange} placeholder="Image link or file name" required />
              <AdmissionField label="Date of Admission" name="dateOfAdmission" type="date" value={formData.dateOfAdmission} onChange={handleChange} required />
              
              <AdmissionField label="Discount In Fee (%)" name="discountInFee" type="number" value={formData.discountInFee} onChange={handleChange} placeholder="0" required />
              <AdmissionField label="Mobile No / WhatsApp" name="mobileNo" value={formData.mobileNo} onChange={handleChange} placeholder="+1 234 567 8900" required />
            </div>
          </section>

          {/* Section 2: Other Information */}
          <section>
            <div className="flex items-center mb-5">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold">2</span>
              <h2 className="text-lg font-semibold text-gray-800">Other Information</h2>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <AdmissionField label="Date Of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
              <AdmissionField label="Student Birth Form ID / NIC" name="studentBirthFormId" value={formData.studentBirthFormId} onChange={handleChange} placeholder="ID Number" required />
              
              <AdmissionField label="Gender" name="gender" type="select" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} required />
              <AdmissionField label="Previous School" name="previousSchool" value={formData.previousSchool} onChange={handleChange} placeholder="School Name" required />
              <AdmissionField label="Religion" name="religion" type="select" value={formData.religion} onChange={handleChange} options={['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Other']} required />
              
              <AdmissionField label="Blood Group" name="bloodGroup" type="select" value={formData.bloodGroup} onChange={handleChange} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} required />
              <AdmissionField label="Previous ID / Board Roll No" name="previousIdBoardRollNo" value={formData.previousIdBoardRollNo} onChange={handleChange} placeholder="Roll Number" required />
              <AdmissionField label="Total Siblings" name="totalSiblings" type="number" value={formData.totalSiblings} onChange={handleChange} placeholder="0" required />
              
              <div className="md:col-span-2">
                <AdmissionField label="Any Additional Note (or N/A)" name="additionalNote" value={formData.additionalNote} onChange={handleChange} placeholder="Special instructions or enter N/A" required />
              </div>
              <div className="md:col-span-3 border-t border-gray-200 mt-2 pt-5">
                <AdmissionField label="Full Address" name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, State, Zip" required />
              </div>
            </div>
          </section>

          {/* Section 3: Father/Guardian Information */}
          <section>
            <div className="flex items-center mb-5">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold">3</span>
              <h2 className="text-lg font-semibold text-gray-800">Father / Guardian Info</h2>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <AdmissionField label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Full Name" required />
              <AdmissionField label="National ID" name="fatherNationalId" value={formData.fatherNationalId} onChange={handleChange} placeholder="National ID" required />
              <AdmissionField label="Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Job Title" required />
              
              <AdmissionField label="Education" name="fatherEducation" value={formData.fatherEducation} onChange={handleChange} placeholder="Highest Degree" required />
              <AdmissionField label="Mobile No" name="fatherMobileNo" value={formData.fatherMobileNo} onChange={handleChange} placeholder="Phone Number" required />
              <AdmissionField label="Monthly Income" name="fatherIncome" type="number" value={formData.fatherIncome} onChange={handleChange} placeholder="Amount" required />
            </div>
          </section>

          {/* Section 4: Mother Information */}
          <section>
            <div className="flex items-center mb-5">
              <span className="bg-[#66cc00] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold">4</span>
              <h2 className="text-lg font-semibold text-gray-800">Mother Information</h2>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <AdmissionField label="Mother Name" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Full Name" required />
              <AdmissionField label="National ID" name="motherNationalId" value={formData.motherNationalId} onChange={handleChange} placeholder="National ID" required />
              <AdmissionField label="Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Job Title" required />
              
              <AdmissionField label="Education" name="motherEducation" value={formData.motherEducation} onChange={handleChange} placeholder="Highest Degree" required />
              <AdmissionField label="Mobile No" name="motherMobileNo" value={formData.motherMobileNo} onChange={handleChange} placeholder="Phone Number" required />
              <AdmissionField label="Monthly Income" name="motherIncome" type="number" value={formData.motherIncome} onChange={handleChange} placeholder="Amount" required />
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
            >
              Reset Form
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-medium text-white bg-[#66cc00] hover:bg-[#5bb800] shadow-sm transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Submit Admission
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}