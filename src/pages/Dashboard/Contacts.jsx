import React, { useState, useEffect } from "react";
import { useContactUs } from "../../Hook/useContactUs"; // Adjust path if necessary
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle";
import TableControls from "../../components/TableControls";
import SkeletonLoader from "../../components/SkeletonLoader";
import MtableLoading from "../../components library/MtableLoading";

export default function ContactsManagement() {
  const {
    contacts,
    pagination,
    loading: contactLoading,
    error: contactError,
    fetchContactsByBranch, 
    removeContact,
  } = useContactUs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "",
    subject: "",
    message: ""
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Dynamic Table Headers with percentage widths for better wrapping ---
  const tableHeaders = [
    { id: "name", label: "Name", className: "py-4 rounded-tl-box w-[15%]" },
    { id: "email", label: "Email", className: "py-4 w-[20%]" },
    { id: "subject", label: "Subject", className: "py-4 w-[20%]" },
    { id: "message", label: "Message", className: "py-4 w-[30%]" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8 w-[15%]" }
  ];

  // Initial fetch using fetchContactsByBranch
  useEffect(() => {
    // Passing undefined as the first argument uses the default 'branch' from the hook
    fetchContactsByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchContactsByBranch, currentPage, limitPerPage, searchTerm]);

  // --- Filter Handlers ---
  const handleLimitChange = (e) => {
    setLimitPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page whenever the limit changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // --- Modal Handlers (View Only) ---
  const openModal = (contactItem) => {
    if (contactItem) {
      setFormData({ 
        name: contactItem.name || "",
        email: contactItem.email || "",
        subject: contactItem.subject || "",
        message: contactItem.message || ""
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  // --- Form & Action Handlers ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact message?")) {
      try {
        await removeContact(id);
        if (contacts.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchContactsByBranch(undefined, currentPage, limitPerPage, searchTerm);
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
        title="Contacts Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize user contact messages
          </span>
        }
        rightcontent={null} 
      />

      {/* Error Alert */}
      {contactError && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{contactError}</span>
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

      {/* Main Table Card (Removed overflow-x-auto to prevent horizontal scrollbar) */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="rounded-box">
          <table className="table table-zebra w-full table-fixed">
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
              {contactLoading ? (
                <SkeletonLoader />
              ) : contacts?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={contacts} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No contact messages found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts?.map((contactItem) => (
                  <tr key={contactItem._id} className="hover">
                    
                    {/* Name Column - Allowed wrapping */}
                    <td className="py-4 align-top whitespace-normal break-words">
                      <div className="font-semibold text-base text-base-content">{contactItem.name}</div>
                    </td>

                    {/* Email Column - Break all for long emails */}
                    <td className="py-4 align-top whitespace-normal break-all">
                      <div className="text-sm text-base-content">{contactItem.email}</div>
                    </td>

                    {/* Subject Column - Allowed wrapping */}
                    <td className="py-4 align-top whitespace-normal break-words">
                      <div className="text-sm text-base-content font-medium">
                        {contactItem.subject}
                      </div>
                    </td>

                    {/* Message Column - Allowed wrapping */}
                    <td className="py-4 align-top whitespace-normal break-words">
                      <div className="text-sm text-base-content/80 leading-relaxed">
                        {contactItem.message}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 align-top text-right pr-6">
                      <div className="join justify-end">
                        
                        {/* View Button */}
                        <button
                          onClick={() => openModal(contactItem)}
                          className="btn btn-sm btn-ghost text-success join-item"
                          title="View Message"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">View</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(contactItem._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Contact"
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

      {/* View-Only DaisyUI Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            View Contact Details
          </h3>

          <div className="py-2">
            
            {/* Name Input */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>

            {/* Email Input */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>

            {/* Subject Input */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Subject</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                readOnly
                className="input input-bordered w-full bg-base-200"
              />
            </div>

            {/* Message Textarea */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Message</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                readOnly
                className="textarea textarea-bordered w-full bg-base-200"
                rows="6"
              ></textarea>
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
        
        {/* Click outside to close */}
        <div className="modal-backdrop" onClick={closeModal}>
          <button className="cursor-default">close</button>
        </div>
      </div>

    </div>
  );
}