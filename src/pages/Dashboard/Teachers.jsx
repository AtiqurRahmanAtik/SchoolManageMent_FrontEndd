import { useEffect, useState } from 'react';
import useTeachers from '../../Hook/useTeachers'; // Adjust path as needed
import useSubject from '../../Hook/useSubject'; // Added useSubject hook
import Pagination from '../../components/Pagination'; // Adjust path as needed
import TableControls from '../../components/TableControls'; // Adjust path as needed
import SkeletonLoader from '../../components/SkeletonLoader'; // Adjust path as needed
import MtableLoading from '../../components library/MtableLoading'; // Adjust path as needed
import Mtitle from '../../components library/Mtitle'; // Adjust path as needed

export default function Teachers() {
  const { 
    teachers, 
    pagination, 
    loading, 
    error, 
    fetchTeachers, 
    getTeacherById,
    removeTeacher,
    createTeacher,
    updateTeacher
  } = useTeachers();

  // Bring in subjects to populate dropdowns dynamically from API
  const { subjects, fetchSubjectsByBranch, loading: subjectLoading } = useSubject();

  // Local state for the "Show entries" dropdown and Search
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Filter State ---
  const [filterSubject, setFilterSubject] = useState("");

  // Form & Add/Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({
    teacherName: '',
    subject: '',
    phoneNumber: '',
    email: '',
    teacherPhoto: ''
  });

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "teacher", label: "Teacher Profile", className: "py-4 rounded-tl-box" },
    { id: "subject", label: "Subject", className: "py-4 hidden sm:table-cell" },
    { id: "contact", label: "Contact Info", className: "py-4 hidden md:table-cell" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Fetch teachers and subjects on component mount
  useEffect(() => {
    fetchTeachers(1, limit);
    fetchSubjectsByBranch(undefined, "", 1, 100); // Fetch subjects for dropdowns
  }, [fetchTeachers, fetchSubjectsByBranch, limit]);

  // --- Extract Unique Subjects from Backend Data ---
  const uniqueSubjects = Array.from(new Set(subjects?.map((s) => s.SubjectName).filter(Boolean)));

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      await removeTeacher(id);
    }
  };

  const handlePageChange = (newPage) => {
    fetchTeachers(newPage, limit);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper to reset form
  const resetForm = () => {
    setFormData({
      teacherName: '',
      subject: '',
      phoneNumber: '',
      email: '',
      teacherPhoto: ''
    });
    setEditId(null);
    setIsModalOpen(false);
  };

  // Handle Add/Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (editId) {
        // Edit mode
        result = await updateTeacher(editId, formData);
      } else {
        // Create mode
        result = await createTeacher(formData);
      }

      if (result) {
        resetForm();
      } else {
        alert(`Failed to ${editId ? 'update' : 'add'} teacher. Please try again.`);
      }
    } catch (err) {
      console.error(`Error ${editId ? 'updating' : 'adding'} teacher:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Button Click
  const handleEditClick = async (id) => {
    const fetchedTeacher = await getTeacherById(id);
    if (fetchedTeacher) {
      setFormData({
        teacherName: fetchedTeacher.teacherName || '',
        subject: fetchedTeacher.subject || '',
        phoneNumber: fetchedTeacher.phoneNumber || '',
        email: fetchedTeacher.email || '',
        teacherPhoto: fetchedTeacher.teacherPhoto || ''
      });
      setEditId(fetchedTeacher._id);
      setIsModalOpen(true);
    } else {
      alert("Could not load teacher data for editing.");
    }
  };

  // Handle View Button Click
  const handleViewClick = async (id) => {
    const fetchedTeacher = await getTeacherById(id);
    if (fetchedTeacher) {
      setViewData(fetchedTeacher);
      setIsViewModalOpen(true);
    } else {
      alert("Could not load teacher data for viewing.");
    }
  };

  // --- Filtered Teachers Logic ---
  const filteredTeachers = teachers?.filter((teacher) => {
    // 1. General search logic
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        teacher.teacherName?.toLowerCase().includes(lowerSearch) ||
        teacher.subject?.toLowerCase().includes(lowerSearch) ||
        teacher.email?.toLowerCase().includes(lowerSearch);
      
      if (!matchesSearch) return false;
    }

    // 2. Subject filter logic
    if (filterSubject && teacher.subject !== filterSubject) {
      return false;
    }

    return true;
  });
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <Mtitle 
        title="Teachers Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize your teaching staff efficiently
          </span>
        }
        rightcontent={
          <button 
            onClick={() => {
              resetForm();
              setIsModalOpen(true); // Opens the Add Teacher Modal
            }}
            className="btn btn-primary shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Teacher
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Table Controls (Search, Limit & Filter) */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit}
          onItemsPerPageChange={handleLimitChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* --- Subject Filter Dropdown (API Integrated) --- */}
        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          <div className="form-control w-full sm:max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-base-content">Filter by Subject</span>
            </label>
            <select 
              className="select select-bordered w-full focus:select-primary"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              disabled={subjectLoading}
            >
              <option value="">{subjectLoading ? "Loading..." : "All Subjects"}</option>
              {uniqueSubjects.map((subject, idx) => (
                <option key={idx} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {(filterSubject || searchTerm) && (
            <button 
              onClick={() => {
                setFilterSubject("");
                setSearchTerm("");
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
              ) : filteredTeachers?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={filteredTeachers} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No teachers found</p>
                      <p className="text-sm">Try adjusting your filters or click "Add New Teacher" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers?.map((teacher) => (
                  <tr key={teacher._id} className="hover">

                    {/* Teacher Profile Column */}
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-200">
                            <img 
                              src={teacher.teacherPhoto} 
                              alt={teacher.teacherName} 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base">{teacher.teacherName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject Column */}
                    <td className="py-4 hidden sm:table-cell">
                      <div className="badge badge-ghost font-medium">
                        {teacher.subject}
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="py-4 hidden md:table-cell">
                      <div className="text-sm font-medium">{teacher.phoneNumber}</div>
                      <div className="text-xs text-base-content/60">{teacher.email}</div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button 
                          onClick={() => handleViewClick(teacher._id)}
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
                          onClick={() => handleEditClick(teacher._id)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Teacher"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Teacher"
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
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center md:justify-end mt-6">
          <div className="join shadow-sm border border-base-200 rounded-lg bg-base-100">
            <Pagination 
              currentPage={pagination?.currentPage || 1}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.totalItems || 0}
              itemsPerPage={pagination?.itemsPerPage || limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Teacher DaisyUI Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            {editId ? 'Edit Teacher Details' : 'Create New Teacher'}
          </h3>

          <form onSubmit={handleSubmit} className="py-2 space-y-3">
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Full Name</span>
              </label>
              <input 
                type="text" 
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g. John Doe"
              />
            </div>
            
            {/* --- Updated Subject Dropdown in the Modal (API Integrated) --- */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Subject</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                disabled={subjectLoading}
                className="select select-bordered w-full focus:select-primary"
              >
                <option value="" disabled>{subjectLoading ? "Loading Subjects..." : "Select a Subject"}</option>
                {uniqueSubjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Phone Number</span>
              </label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Email Address</span>
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g. john@school.edu"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Photo URL</span>
              </label>
              <input 
                type="url" 
                name="teacherPhoto"
                value={formData.teacherPhoto}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="https://example.com/photo.jpg"
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
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (editId ? 'Update Teacher' : 'Save Teacher')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Click outside to close */}
        <div className="modal-backdrop" onClick={resetForm}>
          <button className="cursor-default">close</button>
        </div>
      </div>

      {/* View Single Teacher DaisyUI Modal */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Teacher Profile
          </h3>
          
          {viewData && (
            <div className="flex flex-col items-center py-4">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img 
                    src={viewData.teacherPhoto} 
                    alt={viewData.teacherName} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mb-1">{viewData.teacherName}</h3>
              <div className="badge badge-primary badge-outline font-medium mb-6 px-4 py-3">{viewData.subject}</div>
              
              <div className="w-full bg-base-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-24">Email:</span>
                  <span className="text-base-content">{viewData.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-24">Phone:</span>
                  <span className="text-base-content">{viewData.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-24">Branch:</span>
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

        {/* Click outside to close */}
        <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)}>
          <button className="cursor-default">close</button>
        </div>
      </div>

    </div>
  );
}