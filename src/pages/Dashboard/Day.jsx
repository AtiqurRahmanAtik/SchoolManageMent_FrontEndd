import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDays } from "../../Hook/useDays"; // Adjust path to where you saved the hook
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle"; 
import TableControls from "../../components/TableControls"; // Adjust path as needed
import SkeletonLoader from "../../components/SkeletonLoader"; // Adjust path as needed
import MtableLoading from "../../components library/MtableLoading"; // Adjust path as needed

export default function Day() {
  const {
    days,
    pagination,
    loading,
    error,
    fetchDaysByBranch,
    createDay,
    updateDay,
    removeDay,
  } = useDays();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dayName: "",
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch days by branch when component mounts, or when page/limit/search changes
  useEffect(() => {
    fetchDaysByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchDaysByBranch, currentPage, limitPerPage, searchTerm]);

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

  const openAddModal = () => {
    setFormData({ dayName: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setFormData({
      dayName: d.dayName,
    });
    setEditingId(d._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ dayName: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDay(editingId, { ...formData });
        toast.success("Day updated successfully!");
      } else {
        await createDay({ ...formData });
        toast.success("Day created successfully!");
      }
      closeModal();
      fetchDaysByBranch(undefined, currentPage, limitPerPage, searchTerm);
    } catch (err) {
      console.error("Failed to save day", err);
      toast.error(err.message || "Failed to save day");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this day?")) {
      try {
        await removeDay(id);
        toast.success("Day deleted successfully!");
        if (days.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchDaysByBranch(undefined, currentPage, limitPerPage, searchTerm);
        }
      } catch (err) {
        console.error("Failed to delete day", err);
        toast.error(err.message || "Failed to delete day");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* ToastContainer for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Header Section */}
      <Mtitle
        title="Day Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize days for your branch
          </span>
        }
        rightcontent={
          <button onClick={openAddModal} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Day
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
                <th className="py-4 rounded-tl-box">Day Details</th>
                <th className="py-4 text-right rounded-tr-box pr-8">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Reused Skeleton Loader component
                <SkeletonLoader />
              ) : days?.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-12 text-center">
                    {/* Reused Custom Loading/Empty State Component */}
                    <MtableLoading data={days} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No days found</p>
                      <p className="text-sm">Click "Add New Day" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                days?.map((d) => (
                  <tr key={d._id} className="hover">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="font-bold text-xs uppercase">
                                {/* Extract the first letter for the avatar */}
                                {d.dayName ? d.dayName.charAt(0) : 'D'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base uppercase">{d.dayName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button
                          onClick={() => openEditModal(d)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Day"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Day"
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
              itemsPerPage={pagination.itemsPerPage}
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
            {editingId ? "Edit Day" : "Create New Day"}
          </h3>

          <form onSubmit={handleSubmit} className="py-2">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Day Name</span>
              </label>
              <input
                type="text"
                name="dayName"
                value={formData.dayName}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary uppercase"
                placeholder="e.g., SATURDAY"
              />
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Day"}
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