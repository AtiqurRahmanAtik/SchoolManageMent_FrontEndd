import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGrade } from "../../Hook/useGrade"; 
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle"; 
import TableControls from "../../components/TableControls"; 
import SkeletonLoader from "../../components/SkeletonLoader"; 
import MtableLoading from "../../components library/MtableLoading"; 

export default function Grade() {
  const {
    grades,
    pagination,
    loading,
    error,
    fetchGradesByBranch,
    createGrade,
    updateGrade,
    removeGrade,
  } = useGrade();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State updated to match simplified Model Base
  const [formData, setFormData] = useState({
    gradeName: "",
    gradePoint: "",
    minMark: "",
    maxMark: "",
    remarks: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGradesByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchGradesByBranch, currentPage, limitPerPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimitChange = (e) => {
    setLimitPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const openAddModal = () => {
    setFormData({ 
      gradeName: "", 
      gradePoint: "", 
      minMark: "", 
      maxMark: "", 
      remarks: "" 
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (grade) => {
    setFormData({
      gradeName: grade.gradeName || "",
      gradePoint: grade.gradePoint || "",
      minMark: grade.minMark || "",
      maxMark: grade.maxMark || "",
      remarks: grade.remarks || "",
    });
    setEditingId(grade._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ gradeName: "", gradePoint: "", minMark: "", maxMark: "", remarks: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Numerical values are sent as numbers to match Schema types
      const payload = {
        ...formData,
        gradePoint: Number(formData.gradePoint),
        minMark: Number(formData.minMark),
        maxMark: Number(formData.maxMark),
      };

      if (editingId) {
        await updateGrade(editingId, payload);
        toast.success("Grade updated successfully!");
      } else {
        await createGrade(payload);
        toast.success("Grade created successfully!");
      }
      closeModal();
      fetchGradesByBranch(undefined, currentPage, limitPerPage, searchTerm);
    } catch (err) {
      toast.error(err.message || "Failed to save grade");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await removeGrade(id);
        toast.success("Grade deleted successfully!");
        fetchGradesByBranch(undefined, currentPage, limitPerPage, searchTerm);
      } catch (err) {
        toast.error(err.message || "Failed to delete grade");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <Mtitle
        title="Grade Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Setup grade names, points, and mark ranges for this branch
          </span>
        }
        rightcontent={
          <button onClick={openAddModal} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Grade
          </button>
        }
      />

      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6">
        <TableControls
          itemsPerPage={limitPerPage}
          onItemsPerPageChange={handleLimitChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="overflow-x-auto rounded-box">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content text-sm">
              <tr>
                <th className="py-4">Grade Name</th>
                <th className="py-4">Grade Point</th>
                <th className="py-4">Marks Range</th>
                <th className="py-4">Remarks</th>
                <th className="py-4 text-right pr-8">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonLoader />
              ) : grades?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <MtableLoading data={grades} />
                    <p className="text-lg font-medium text-base-content/50 mt-4">No grades found</p>
                  </td>
                </tr>
              ) : (
                grades?.map((grade) => (
                  <tr key={grade._id} className="hover">
                    <td className="py-4 font-bold text-primary uppercase">{grade.gradeName}</td>
                    <td className="py-4 font-semibold">{grade.gradePoint}</td>
                    <td className="py-4">
                      <div className="badge badge-ghost font-mono">
                        {grade.minMark} - {grade.maxMark}
                      </div>
                    </td>
                    <td className="py-4 italic text-sm">{grade.remarks}</td>
                    <td className="py-4 text-right pr-6">
                      <div className="join">
                        <button onClick={() => openEditModal(grade)} className="btn btn-sm btn-ghost text-info join-item">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(grade._id)} className="btn btn-sm btn-ghost text-error join-item">
                          Delete
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box max-w-2xl">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <h3 className="font-bold text-xl mb-6 border-b pb-2">
            {editingId ? "Edit Grade Configuration" : "New Grade Configuration"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full md:col-span-2">
              <label className="label"><span className="label-text font-semibold">Grade Name</span></label>
              <input 
                name="gradeName" 
                value={formData.gradeName} 
                onChange={handleInputChange} 
                required 
                className="input input-bordered uppercase" 
                placeholder="e.g., A+" 
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Grade Point</span></label>
              <input 
                name="gradePoint" 
                type="number" 
                step="0.01" 
                value={formData.gradePoint} 
                onChange={handleInputChange} 
                required 
                className="input input-bordered" 
                placeholder="e.g., 5.00" 
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Remarks</span></label>
              <input 
                name="remarks" 
                type="text" 
                value={formData.remarks} 
                onChange={handleInputChange} 
                required 
                className="input input-bordered" 
                placeholder="e.g., Excellent" 
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Min Mark</span></label>
              <input 
                name="minMark" 
                type="number" 
                value={formData.minMark} 
                onChange={handleInputChange} 
                required 
                className="input input-bordered" 
                placeholder="0" 
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Max Mark</span></label>
              <input 
                name="maxMark" 
                type="number" 
                value={formData.maxMark} 
                onChange={handleInputChange} 
                required 
                className="input input-bordered" 
                placeholder="100" 
              />
            </div>

            <div className="modal-action md:col-span-2 mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary min-w-[120px]">
                {loading ? <span className="loading loading-spinner"></span> : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={closeModal}><button>close</button></div>
      </div>
    </div>
  );
}