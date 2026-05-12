import React, { useState, useEffect } from "react";
import { useBlogs } from "../../Hook/useBlogs"; // Adjust path if necessary
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle";
import TableControls from "../../components/TableControls";
import SkeletonLoader from "../../components/SkeletonLoader";
import MtableLoading from "../../components library/MtableLoading";

export default function BlogsManagement() {
  const {
    blogs,
    pagination,
    loading: blogLoading,
    error: blogError,
    fetchBlogsByBranch, 
    createBlog,
    updateBlog,
    removeBlog,
  } = useBlogs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    image: "", 
    blogWriter: "",
    department: "",
    blogHeadline: "",
    description: "",
    tag: ""
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "image", label: "Image", className: "py-4 rounded-tl-box" },
    { id: "blogHeadline", label: "Headline", className: "py-4" },
    { id: "blogWriter", label: "Writer", className: "py-4" },
    { id: "department", label: "Department", className: "py-4" },
    { id: "tag", label: "Tag", className: "py-4" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Initial fetch using fetchBlogsByBranch
  useEffect(() => {
    // Passing undefined as the first argument uses the default 'branch' from the hook
    fetchBlogsByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchBlogsByBranch, currentPage, limitPerPage, searchTerm]);

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
  const openModal = (blogItem = null) => {
    if (blogItem) {
      setEditingId(blogItem._id);
      setFormData({ 
        image: blogItem.image || "",
        blogWriter: blogItem.blogWriter || "",
        department: blogItem.department || "",
        blogHeadline: blogItem.blogHeadline || "",
        description: blogItem.description || "",
        tag: blogItem.tag || ""
      });
    } else {
      setEditingId(null);
      setFormData({ image: "", blogWriter: "", department: "", blogHeadline: "", description: "", tag: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ image: "", blogWriter: "", department: "", blogHeadline: "", description: "", tag: "" });
  };

  // --- Form & Action Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBlog(editingId, formData);
      } else {
        await createBlog(formData);
      }
      fetchBlogsByBranch(undefined, currentPage, limitPerPage, searchTerm);
      closeModal();
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await removeBlog(id);
        if (blogs.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchBlogsByBranch(undefined, currentPage, limitPerPage, searchTerm);
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
        title="Blogs Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize campus blogs and articles
          </span>
        }
        rightcontent={
          <button onClick={() => openModal()} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Blog
          </button>
        }
      />

      {/* Error Alert */}
      {blogError && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{blogError}</span>
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
              {blogLoading ? (
                <SkeletonLoader />
              ) : blogs?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={blogs} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                      </svg>
                      <p className="text-lg font-medium">No blogs found</p>
                      <p className="text-sm">Click "Add New Blog" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs?.map((blogItem) => (
                  <tr key={blogItem._id} className="hover">
                    
                    {/* Image Column */}
                    <td className="py-4">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded shadow border border-base-200">
                          <img 
                            src={blogItem.image} 
                            alt={blogItem.blogHeadline} 
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Headline Column */}
                    <td className="py-4">
                      <div className="font-semibold text-base text-base-content truncate max-w-[200px]" title={blogItem.blogHeadline}>
                        {blogItem.blogHeadline}
                      </div>
                    </td>

                    {/* Writer Column */}
                    <td className="py-4">
                      <div className="text-sm text-base-content whitespace-nowrap">{blogItem.blogWriter}</div>
                    </td>

                    {/* Department Column */}
                    <td className="py-4">
                      <div className="text-sm text-base-content whitespace-nowrap">{blogItem.department}</div>
                    </td>

                    {/* Tag Column */}
                    <td className="py-4">
                      <div className="badge badge-outline text-xs">{blogItem.tag}</div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button
                          onClick={() => openModal(blogItem)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Blog"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(blogItem._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Blog"
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
        <div className="modal-box max-w-3xl">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            {editingId ? "Edit Blog Details" : "Create New Blog"}
          </h3>

          <form onSubmit={handleSubmit} className="py-2">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blog Headline Input */}
              <div className="form-control w-full mb-2 md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Blog Headline</span>
                </label>
                <input
                  type="text"
                  name="blogHeadline"
                  value={formData.blogHeadline}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Enter blog headline"
                />
              </div>

              {/* Writer Input */}
              <div className="form-control w-full mb-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Writer</span>
                </label>
                <input
                  type="text"
                  name="blogWriter"
                  value={formData.blogWriter}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Enter writer's name"
                />
              </div>

              {/* Department Input */}
              <div className="form-control w-full mb-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Department</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Enter department"
                />
              </div>

              {/* Tag Input */}
              <div className="form-control w-full mb-2 md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Tag</span>
                </label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Enter a tag (e.g., Technology, Education)"
                />
              </div>

              {/* Description Textarea */}
              <div className="form-control w-full mb-2 md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="textarea textarea-bordered w-full focus:textarea-primary"
                  placeholder="Enter blog content/description"
                  rows="5"
                ></textarea>
              </div>

              {/* Image URL Input */}
              <div className="form-control w-full mb-2 md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Image URL</span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="https://example.com/blog-image.jpg"
                />
                {formData.image && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="h-32 w-auto object-cover rounded border border-base-200 shadow-sm"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={blogLoading} className="btn btn-primary min-w-[100px]">
                {blogLoading ? <span className="loading loading-spinner loading-sm"></span> : "Save Blog"}
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