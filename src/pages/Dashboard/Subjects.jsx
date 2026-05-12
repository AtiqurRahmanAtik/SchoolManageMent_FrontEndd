import React, { useState, useEffect } from "react";
import useSubject from "../../Hook/useSubject"; // Adjust path as needed
import useSection from "../../Hook/useSection"; // Adjust path as needed
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle"; 
import TableControls from "../../components/TableControls"; 
import SkeletonLoader from "../../components/SkeletonLoader"; 
import MtableLoading from "../../components library/MtableLoading"; 

export default function Subjects() {
  const {
    subjects,
    pagination,
    loading,
    error,
    fetchSubjectsByBranch,
    createSubject,
    updateSubject,
    removeSubject,
  } = useSubject();

  // Bring in sections to extract dynamic class names for the dropdown
  const { sections, getSections } = useSection();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    SubjectCode: "", // Added SubjectCode
    ClassName: "",
    SubjectName: "",
    Marks: "",
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState(""); // New state for Class filter

  // Fetch subjects by branch when component mounts, or when page/limit/search changes
  useEffect(() => {
    // Pass searchTerm to the backend via the updated hook
    fetchSubjectsByBranch(undefined, searchTerm, currentPage, limitPerPage);
  }, [fetchSubjectsByBranch, searchTerm, currentPage, limitPerPage]);

  // Fetch sections/classes for the dropdown when component mounts
  useEffect(() => {
    getSections(1, 100); // Fetch a large limit to populate the dropdown
  }, [getSections]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Filter Handlers ---
  const handleLimitChange = (e) => {
    setLimitPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const openAddModal = () => {
    setFormData({ SubjectCode: "", ClassName: "", SubjectName: "", Marks: "" }); // Reset SubjectCode
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setFormData({
      SubjectCode: sub.SubjectCode || "", // Map SubjectCode
      ClassName: sub.ClassName,
      SubjectName: sub.SubjectName,
      Marks: sub.Marks,
    });
    setEditingId(sub._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ SubjectCode: "", ClassName: "", SubjectName: "", Marks: "" }); // Reset SubjectCode
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSubject(editingId, { ...formData });
      } else {
        await createSubject({ ...formData });
      }
      closeModal();
      fetchSubjectsByBranch(undefined, searchTerm, currentPage, limitPerPage);
    } catch (err) {
      console.error("Failed to save subject", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await removeSubject(id);
        if (subjects.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchSubjectsByBranch(undefined, searchTerm, currentPage, limitPerPage);
        }
      } catch (err) {
        console.error("Failed to delete subject", err);
      }
    }
  };

  // Extract unique class names from the sections array for the dropdowns
  const uniqueClasses = Array.from(
    new Set(sections?.map((sec) => sec.className || sec.sectionName).filter(Boolean))
  );

  // Local filtering for the Class Dropdown applied to the current page data
  const displayedSubjects = selectedClassFilter 
    ? subjects?.filter((sub) => sub.ClassName === selectedClassFilter)
    : subjects;

  return (
    <div>
    
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <Mtitle
          title="Subjects Management"
          middlecontent={
            <span className="text-sm text-base-content/70 hidden md:inline-block">
              Manage and organize subjects for your branch
            </span>
          }
          rightcontent={
            <button onClick={openAddModal} className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Subject
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

        {/* Table Controls (Search, Limit, & Class Filter) */}
        <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full">
            <TableControls
              itemsPerPage={limitPerPage}
              onItemsPerPageChange={handleLimitChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
          
          {/* Main UI Class Dropdown Filter */}
          <div className="w-full md:w-auto">
            <select
              className="select select-bordered w-full md:w-64 focus:select-primary"
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="overflow-x-auto rounded-box">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200 text-base-content text-sm">
                <tr>
                  <th className="py-4 rounded-tl-box">Subject Code</th>
                  <th className="py-4">Subject Name</th>
                  <th className="py-4">Class Name</th>
                  <th className="py-4">Marks</th>
                  <th className="py-4 text-right rounded-tr-box pr-8">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonLoader />
                ) : displayedSubjects?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <MtableLoading data={displayedSubjects} />
                      <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-lg font-medium">No subjects found</p>
                        <p className="text-sm">Click "Add New Subject" to create one.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedSubjects?.map((sub) => (
                    <tr key={sub._id} className="hover">
                      <td className="py-4 text-base-content/80 font-semibold">{sub.SubjectCode}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span className="font-bold">{sub.SubjectName?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-base">{sub.SubjectName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-base-content/80 font-medium">{sub.ClassName}</td>
                      <td className="py-4 text-base-content/80">{sub.Marks}</td>
                      <td className="py-4 text-right pr-6">
                        <div className="join justify-end">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="btn btn-sm btn-ghost text-info join-item"
                            title="Edit Subject"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="btn btn-sm btn-ghost text-error join-item"
                            title="Delete Subject"
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
        {pagination && pagination.totalPages > 1 && !selectedClassFilter && ( // Hide pagination if local filter is active to avoid mismatch
          <div className="flex justify-center md:justify-end mt-6">
            <div className="join shadow-sm border border-base-200 rounded-lg bg-base-100">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* Add/Edit DaisyUI Modal */}
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
          <div className="modal-box">
            <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            
            <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
              {editingId ? "Edit Subject Details" : "Create New Subject"}
            </h3>

            <form onSubmit={handleSubmit} className="py-2 space-y-4">
              
              {/* Added Subject Code Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Subject Code</span>
                </label>
                <input
                  type="text"
                  name="SubjectCode"
                  value={formData.SubjectCode}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="e.g., MAT-101"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Add Subject Name</span>
                </label>
                <input
                  type="text"
                  name="SubjectName"
                  value={formData.SubjectName}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="e.g., Mathematics"
                />
              </div>

              {/* Select Class Dropdown dynamically populated from useSection */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Select Class</span>
                </label>
                <select
                  name="ClassName"
                  value={formData.ClassName}
                  onChange={handleInputChange}
                  required
                  className="select select-bordered w-full focus:select-primary"
                >
                  <option value="" disabled>Select a class</option>
                  {uniqueClasses.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Marks</span>
                </label>
                <input
                  type="number"
                  name="Marks"
                  value={formData.Marks}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="e.g., 100"
                />
              </div>

              <div className="modal-action mt-6">
                <button type="button" onClick={closeModal} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
          
          {/* Click outside to close */}
          <div className="modal-backdrop" onClick={closeModal}>
            <button type="button" className="cursor-default">close</button>
          </div>
        </div>
      </div>
    </div>
  );
}