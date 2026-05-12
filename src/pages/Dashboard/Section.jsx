import  { useState, useEffect } from "react";
import { useSection } from "../../Hook/useSection";
import { useClass } from "../../Hook/useClass";
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle";
import TableControls from "../../components/TableControls";
import SkeletonLoader from "../../components/SkeletonLoader";
import MtableLoading from "../../components library/MtableLoading";

export default function Sections() {
  const {
    sections,
    pagination,
    loading: sectionLoading,
    error: sectionError,
    getSections,
    addSection,
    updateSection,
    deleteSection,
  } = useSection();

  const { 
    classes, 
    fetchClassesByBranch 
  } = useClass();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    sectionName: "", 
    classId: "" 
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Dynamic Table Headers ---
  // Removed ID, ordered Class Name first, Section Name second
  const tableHeaders = [
    { id: "className", label: "Class Name", className: "py-4 rounded-tl-box" },
    { id: "sectionName", label: "Section Name", className: "py-4" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Initial fetch
  useEffect(() => {
    // If your section hook/backend supports search, you can pass searchTerm here.
    getSections(currentPage, limitPerPage);
    fetchClassesByBranch(undefined, 1, 100); 
  }, [getSections, fetchClassesByBranch, currentPage, limitPerPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Filter Handlers ---
  const handleLimitChange = (e) => {
    setLimitPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page whenever the limit changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // --- Modal Handlers ---
  const openModal = (section = null) => {
    if (section) {
      setEditingId(section._id);
      setFormData({ 
        sectionName: section.sectionName,
        classId: section.class?._id || section.classId?._id || section.classId || "" 
      });
    } else {
      setEditingId(null);
      setFormData({ sectionName: "", classId: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ sectionName: "", classId: "" });
  };

  // --- Form & Action Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;

    // Find the actual class name based on the selected classId
    const selectedClass = classes.find(c => c._id === formData.classId);
    const classNameString = selectedClass ? (selectedClass.className || selectedClass.name) : "";

    // Create the full payload including the mapped class name
    const payloadToSend = {
      ...formData,
      className: classNameString
    };

    if (editingId) {
      res = await updateSection(editingId, payloadToSend);
    } else {
      res = await addSection(payloadToSend);
    }

    if (res.success) {
      closeModal();
      getSections(currentPage, limitPerPage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      const res = await deleteSection(id);
      if (res.success) {
        if (sections.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          getSections(currentPage, limitPerPage);
        }
      }
    }
  };

  // Helper function to find class name for display in table
  const getClassName = (section) => {
    if (section.className) return section.className; 
    if (section.class?.className) return section.class.className;
    if (section.classId?.className) return section.classId.className;
    const matchedClass = classes.find(c => c._id === section.classId || c._id === section.class);
    return matchedClass ? matchedClass.className : "Unassigned";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <Mtitle
        title="Sections Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize your class sections efficiently
          </span>
        }
        rightcontent={
          <button onClick={() => openModal()} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Section
          </button>
        }
      />

      {/* Error Alert */}
      {sectionError && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{sectionError}</span>
        </div>
      )}

      {/* Table Controls (Search & Limit) */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6">
        <TableControls
          itemsPerPage={limitPerPage}
          onItemsPerPageChange={handleLimitChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
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
              {sectionLoading ? (
                <SkeletonLoader />
              ) : sections?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={sections} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium">No sections found</p>
                      <p className="text-sm">Click "Add New Section" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sections?.map((section) => (
                  <tr key={section._id} className="hover">
                    
                    {/* Class Name Column */}
                    <td className="py-4">
                      <div className="badge badge-ghost font-medium">
                        {getClassName(section)}
                      </div>
                    </td>

                    {/* Section Name Column */}
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="font-bold">{section.sectionName.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base">{section.sectionName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button
                          onClick={() => openModal(section)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Section"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(section._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Section"
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
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={limitPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Add/Edit DaisyUI Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            {editingId ? "Edit Section Details" : "Create New Section"}
          </h3>

          <form onSubmit={handleSubmit} className="py-2">
            
            {/* Class Selection Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Assign to Class</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                required
                className="select select-bordered w-full focus:select-primary"
              >
                <option value="" disabled>Select a Class</option>
                {classes && classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className || cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Name Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Section Name</span>
              </label>
              <input
                type="text"
                name="sectionName"
                value={formData.sectionName}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g., Nursery, Class A"
              />
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={sectionLoading} className="btn btn-primary min-w-[100px]">
                {sectionLoading ? <span className="loading loading-spinner loading-sm"></span> : "Save Section"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Click outside to close */}
        <div className="modal-backdrop" onClick={closeModal}>
          <button className="cursor-default">close</button>
        </div>
      </div>

    </div>
  );
}