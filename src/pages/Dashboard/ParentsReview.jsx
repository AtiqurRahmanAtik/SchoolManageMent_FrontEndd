import React, { useState, useEffect } from "react";
import { useParentsReviews } from "../../Hook/useParentsReviews"; // Adjust path if necessary
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle";
import TableControls from "../../components/TableControls";
import SkeletonLoader from "../../components/SkeletonLoader";
import MtableLoading from "../../components library/MtableLoading";

export default function ParentsReview() {
  const {
    parentsReviews,
    pagination,
    loading: reviewLoading,
    error: reviewError,
    fetchParentsReviewsByBranch, 
    createParentsReview,
    updateParentsReview,
    removeParentsReview,
  } = useParentsReviews();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    parentsName: "", 
    parentsReview: "",
    parentsImage: ""
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "parentsImage", label: "Image", className: "py-4 rounded-tl-box" },
    { id: "parentsName", label: "Parent Name", className: "py-4" },
    { id: "parentsReview", label: "Review", className: "py-4" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Initial fetch using fetchParentsReviewsByBranch
  useEffect(() => {
    // Passing undefined as the first argument uses the default 'branch' from the hook
    fetchParentsReviewsByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchParentsReviewsByBranch, currentPage, limitPerPage, searchTerm]);

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
  const openModal = (review = null) => {
    if (review) {
      setEditingId(review._id);
      setFormData({ 
        parentsName: review.parentsName,
        parentsReview: review.parentsReview,
        parentsImage: review.parentsImage
      });
    } else {
      setEditingId(null);
      setFormData({ parentsName: "", parentsReview: "", parentsImage: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ parentsName: "", parentsReview: "", parentsImage: "" });
  };

  // --- Form & Action Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateParentsReview(editingId, formData);
      } else {
        await createParentsReview(formData);
      }
      fetchParentsReviewsByBranch(undefined, currentPage, limitPerPage, searchTerm);
      closeModal();
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await removeParentsReview(id);
        if (parentsReviews.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchParentsReviewsByBranch(undefined, currentPage, limitPerPage, searchTerm);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <Mtitle
        title="Parents Reviews Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize parents testimonials and reviews
          </span>
        }
        rightcontent={
          <button onClick={() => openModal()} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Review
          </button>
        }
      />

      {/* Error Alert */}
      {reviewError && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{reviewError}</span>
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
              {reviewLoading ? (
                <SkeletonLoader />
              ) : parentsReviews?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={parentsReviews} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No reviews found</p>
                      <p className="text-sm">Click "Add New Review" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                parentsReviews?.map((review) => (
                  <tr key={review._id} className="hover">
                    
                    {/* Image Column */}
                    <td className="py-4">
                      <div className="avatar">
                        <div className="w-16 rounded-full shadow border border-base-200">
                          <img 
                            src={review.parentsImage} 
                            alt={review.parentsName} 
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Parent Name Column */}
                    <td className="py-4">
                      <div className="font-semibold text-base text-base-content">{review.parentsName}</div>
                    </td>

                    {/* Review Column */}
                    <td className="py-4">
                      <div className="text-sm text-base-content/80 max-w-sm truncate" title={review.parentsReview}>
                        {review.parentsReview}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button
                          onClick={() => openModal(review)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Review"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Review"
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
            {editingId ? "Edit Review Details" : "Create New Review"}
          </h3>

          <form onSubmit={handleSubmit} className="py-2">
            
            {/* Parent Name Input */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Parent Name</span>
              </label>
              <input
                type="text"
                name="parentsName"
                value={formData.parentsName}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="Enter parent's name"
              />
            </div>

            {/* Parents Review Textarea */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Review</span>
              </label>
              <textarea
                name="parentsReview"
                value={formData.parentsReview}
                onChange={handleInputChange}
                required
                className="textarea textarea-bordered w-full focus:textarea-primary"
                placeholder="Enter review text"
                rows="4"
              ></textarea>
            </div>

            {/* Image URL Input */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Parent Image URL</span>
              </label>
              <input
                type="url"
                name="parentsImage"
                value={formData.parentsImage}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="https://example.com/parent-image.jpg"
              />
              {formData.parentsImage && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={formData.parentsImage} 
                    alt="Preview" 
                    className="h-24 w-24 object-cover rounded-full border border-base-200 shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={reviewLoading} className="btn btn-primary min-w-[100px]">
                {reviewLoading ? <span className="loading loading-spinner loading-sm"></span> : "Save Review"}
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