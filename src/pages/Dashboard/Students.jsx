import React, { useEffect, useState } from 'react';
import useStudents from '../../Hook/useStudents'; 
import useSection from '../../Hook/useSection'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Import your reusable components (Adjust the paths according to your project structure)
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function Students() {
  // --- Student Hook ---
  const {
    students,
    pagination,
    loading,
    error,
    fetchStudentsByBranch,
    fetchStudentById,
    removeStudent,
    updateStudent
  } = useStudents();

  // --- Section Hook ---
  const { sections, getSections } = useSection();

  // Local state for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // --- NEW: Filter States ---
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [appliedFilterClass, setAppliedFilterClass] = useState("");
  const [appliedFilterSection, setAppliedFilterSection] = useState("");

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    studentClass: '',
    section: '',
    mobileNo: '',
  });

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "student", label: "Student Profile", className: "py-4 rounded-tl-box" },
    { id: "registration", label: "Registration No", className: "py-4 hidden sm:table-cell" },
    { id: "classInfo", label: "Class & Section", className: "py-4 hidden md:table-cell" },
    { id: "contact", label: "Contact Info", className: "py-4 hidden lg:table-cell" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Fetch sections for the dropdowns on component mount
  useEffect(() => {
    // Fetch a large limit to ensure all sections/classes populate the dropdown
    getSections(1, 1000); 
  }, [getSections]);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch students
  useEffect(() => {
    fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch);
  }, [fetchStudentsByBranch, currentPage, limit, debouncedSearch]);

  // --- Dropdown Logic Extraction ---
  // Get unique classes from the sections array
  const uniqueClasses = Array.from(new Set(sections?.map((s) => s.className).filter(Boolean)));
  
  // Get sections based on the currently selected class in the EDIT form
  const availableSections = sections
    ?.filter((s) => s.className === formData.studentClass)
    .map((s) => s.sectionName)
    .filter(Boolean);

  // Get sections based on the currently selected class in the FILTER dropdown
  const filterAvailableSections = Array.from(new Set(sections
    ?.filter((s) => !filterClass || s.className === filterClass)
    .map((s) => s.sectionName)
    .filter(Boolean)));

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Handle Input Change for Modals
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // If the user changes the class, reset the section so they don't submit mismatched data
      if (name === 'studentClass') {
        updatedData.section = '';
      }
      
      return updatedData;
    });
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentClass: '',
      section: '',
      mobileNo: '',
    });
    setEditId(null);
    setIsModalOpen(false);
  };

  // --- NEW: Handle Filter Search ---
  const handleFilterSearch = () => {
    setAppliedFilterClass(filterClass);
    setAppliedFilterSection(filterSection);
    setCurrentPage(1);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await removeStudent(id);
        toast.success("Student deleted successfully!");
        if (students.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch);
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete student.");
      }
    }
  };

  // Handle View Button Click
  const handleViewClick = async (id) => {
    try {
      const fetchedStudent = await fetchStudentById(id);
      const data = fetchedStudent?.data || fetchedStudent;
      if (data) {
        setViewData(data);
        setIsViewModalOpen(true);
      } else {
        toast.error("Could not load student data for viewing.");
      }
    } catch (err) {
      toast.error("Failed to fetch student details.");
    }
  };

  // Handle Edit Button Click
  const handleEditClick = async (id) => {
    try {
      const fetchedStudent = await fetchStudentById(id);
      const data = fetchedStudent?.data || fetchedStudent;

      if (data) {
        setFormData({
          studentName: data.studentName || '',
          studentClass: data.studentClass || '',
          section: data.section || '',
          mobileNo: data.mobileNo || data.fatherMobileNo || '',
        });
        setEditId(data._id);
        setIsModalOpen(true);
      } else {
        toast.error("Could not load student data for editing.");
      }
    } catch (err) {
      toast.error("Failed to fetch student details.");
    }
  };

  // Handle Edit Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateStudent(editId, formData);
      toast.success("Student updated successfully!");
      resetForm();
      fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch); 
    } catch (err) {
      toast.error(err.message || "Failed to update student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UPDATED: Applying Client-Side Filters ---
  const filteredStudents = students?.filter((student) => {
    // 1. Check general search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch = 
        student.studentName?.toLowerCase().includes(lowerSearch) ||
        student.registrationNo?.toLowerCase().includes(lowerSearch) ||
        student.studentClass?.toLowerCase().includes(lowerSearch);
      
      if (!matchSearch) return false;
    }

    // 2. Check Class filter
    if (appliedFilterClass && student.studentClass !== appliedFilterClass) {
      return false;
    }

    // 3. Check Section filter
    if (appliedFilterSection && student.section !== appliedFilterSection) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <Mtitle 
        title="Students List" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view all enrolled students.
          </span>
        }
        rightcontent={
          <Link to={"/admissions"}>
            <button className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Student
            </button>
          </Link>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex flex-col">
            <span className="font-semibold">Error Loading Students</span>
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch)}
            className="btn btn-sm btn-outline border-white text-white hover:bg-white hover:text-error"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table Controls & Filter Section */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        {/* Existing Controls */}
        <TableControls 
          itemsPerPage={limit} 
          onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* NEW: Class & Section Dropdowns + Search Button */}
        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          
          <div className="form-control w-full sm:max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-base-content">Filter by Class</span>
            </label>
            <select 
              className="select select-bordered w-full focus:select-primary"
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilterSection(""); // Reset section automatically if class changes
              }}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="form-control w-full sm:max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-base-content">Filter by Section</span>
            </label>
            <select 
              className="select select-bordered w-full focus:select-primary disabled:opacity-50"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              disabled={!filterClass}
            >
              <option value="">All Sections</option>
              {filterAvailableSections.map((sec, idx) => (
                <option key={idx} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleFilterSearch}
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>

          {/* Optional: Clear Filter Button if filters are active */}
          {(appliedFilterClass || appliedFilterSection) && (
            <button 
              onClick={() => {
                setFilterClass("");
                setFilterSection("");
                setAppliedFilterClass("");
                setAppliedFilterSection("");
                setCurrentPage(1);
              }}
              className="btn btn-ghost text-error"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Main Table Card */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="overflow-x-auto rounded-box">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content text-sm">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header.id} className={header.className}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <SkeletonLoader />
              ) : filteredStudents?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={filteredStudents} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-sm">Try adjusting your search criteria or add new students.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents?.map((student) => (
                  <tr key={student._id} className="hover">
                    
                    {/* Student Profile Column */}
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-200">
                            <img 
                              src={student.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=random`} 
                              alt={student.studentName} 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base">{student.studentName}</div>
                          <div className="text-xs text-base-content/60">{student.gender || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Registration Column */}
                    <td className="py-4 hidden sm:table-cell">
                      <div className="badge badge-ghost font-medium">
                        {student.registrationNo || 'N/A'}
                      </div>
                    </td>

                    {/* Class & Section Column */}
                    <td className="py-4 hidden md:table-cell">
                      <div className="text-sm font-medium">{student.studentClass || 'N/A'}</div>
                      <div className="text-xs text-base-content/60">Sec: {student.section || 'N/A'}</div>
                    </td>

                    {/* Contact Column */}
                    <td className="py-4 hidden lg:table-cell">
                      <div className="text-sm font-medium">{student.mobileNo || student.fatherMobileNo || 'No Number'}</div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button 
                          onClick={() => handleViewClick(student._id)}
                          className="btn btn-sm btn-ghost text-success join-item"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">View</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(student._id)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Student"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(student._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Student"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center md:justify-end mt-6">
          <div className="join shadow-sm border border-base-200 rounded-lg bg-base-100">
            <Pagination 
              currentPage={currentPage}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.totalItems || 0}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL (DaisyUI) --- */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Edit Student Details
          </h3>

          <form onSubmit={handleSubmit} className="py-2 space-y-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Student Name</span>
              </label>
              <input 
                type="text" 
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
              />
            </div>

            <div className="flex gap-4">
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Class</span>
                </label>
                <select 
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleInputChange}
                  required
                  className="select select-bordered w-full focus:select-primary"
                >
                  <option value="" disabled>Select Class</option>
                  {uniqueClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Section</span>
                </label>
                <select 
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.studentClass} 
                  className="select select-bordered w-full focus:select-primary disabled:opacity-50"
                >
                  <option value="" disabled>Select Section</option>
                  {availableSections?.map((sec, idx) => (
                    <option key={idx} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Contact Number</span>
              </label>
              <input 
                type="text" 
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                className="input input-bordered w-full focus:input-primary"
              />
            </div>

            <div className="modal-action mt-6">
              <button 
                type="button" 
                onClick={resetForm}
                disabled={isSubmitting}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary min-w-[120px]"
              >
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={resetForm}>
          <button className="cursor-default">close</button>
        </div>
      </div>

      {/* --- VIEW STUDENT MODAL (DaisyUI) --- */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Student Profile
          </h3>
          
          {viewData && (
            <div className="flex flex-col items-center py-4">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img 
                    src={viewData.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewData.studentName)}&background=random`} 
                    alt={viewData.studentName} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mb-1">{viewData.studentName}</h3>
              <div className="badge badge-primary badge-outline font-medium mb-6 px-4 py-3">
                Class {viewData.studentClass} - Sec {viewData.section}
              </div>
              
              <div className="w-full bg-base-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Reg No:</span>
                  <span className="text-base-content">{viewData.registrationNo || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Gender:</span>
                  <span className="text-base-content">{viewData.gender || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Phone:</span>
                  <span className="text-base-content">{viewData.mobileNo || viewData.fatherMobileNo || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Branch:</span>
                  <span className="text-base-content">{viewData.branch || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-action border-t border-base-200 pt-4 mt-2">
             <button 
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-neutral"
              >
                Close
              </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)}>
          <button className="cursor-default">close</button>
        </div>
      </div>

    </div>
  );
}