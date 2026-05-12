import React, { useState, useEffect } from "react";
import { useClassTimes } from "../../Hook/useClassTimes"; // Adjust path to where you saved the hook
import Pagination from "../../components/Pagination";
import Mtitle from "../../components library/Mtitle"; 
import TableControls from "../../components/TableControls"; // Adjust path as needed
import SkeletonLoader from "../../components/SkeletonLoader"; // Adjust path as needed
import MtableLoading from "../../components library/MtableLoading"; // Adjust path as needed

export default function ClassTime() {
  const {
    classTimes,
    pagination,
    loading,
    error,
    fetchClassTimesByBranch,
    createClassTime,
    updateClassTime,
    removeClassTime,
  } = useClassTimes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    classTime: "",
  });

  // --- Pagination & Filter States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch class times by branch when component mounts, or when page/limit/search changes
  useEffect(() => {
    fetchClassTimesByBranch(undefined, currentPage, limitPerPage, searchTerm);
  }, [fetchClassTimesByBranch, currentPage, limitPerPage, searchTerm]);

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
    setFormData({ classTime: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ct) => {
    setFormData({
      classTime: ct.classTime,
    });
    setEditingId(ct._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ classTime: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClassTime(editingId, { ...formData });
      } else {
        await createClassTime({ ...formData });
      }
      closeModal();
      fetchClassTimesByBranch(undefined, currentPage, limitPerPage, searchTerm);
    } catch (err) {
      console.error("Failed to save class time", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class time?")) {
      try {
        await removeClassTime(id);
        if (classTimes.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchClassTimesByBranch(undefined, currentPage, limitPerPage, searchTerm);
        }
      } catch (err) {
        console.error("Failed to delete class time", err);
      }
    }
  };

  // --- SORTING LOGIC FOR TIME ASCENDING ORDER (Morning -> Afternoon) ---
  const parseTimeForSort = (timeStr) => {
    if (!timeStr) return 0;
    const normalized = timeStr.toLowerCase().replace(/\s+/g, '');
    const firstPart = normalized.split(/[-to]/)[0] || ""; 
    const match = firstPart.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    
    let hour = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    
    const isPM = firstPart.includes('pm');
    const isAM = firstPart.includes('am');

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    
    if (!isPM && !isAM) {
       if (hour >= 1 && hour <= 7) hour += 12;
    }
    return hour * 60 + min; 
  };

  // --- TIME DISPLAY FORMATTER (e.g. 8:00-9:00 -> 8:00 AM - 9:00 AM) ---
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    
    const format12Hour = (timePart) => {
      let cleanTime = timePart.toLowerCase().replace(/am|pm/g, '').trim();
      let [h, m] = cleanTime.split(':');
      
      if (!h || !m) return timePart.trim();
      
      let hour = parseInt(h.trim(), 10);
      let min = m.trim();
      let ampm = "AM";
      
      if (timePart.toLowerCase().includes('pm')) {
          ampm = "PM";
      } else if (timePart.toLowerCase().includes('am')) {
          ampm = "AM";
      } else {
          if (hour >= 12) {
            ampm = "PM";
          } else if (hour >= 1 && hour <= 7) {
            ampm = "PM";
          } else {
            ampm = "AM";
          }
      }

      let displayHour = hour;
      if (displayHour > 12) displayHour -= 12;
      if (displayHour === 0) displayHour = 12;

      // Ensure minutes format is exactly 2 digits
      const displayMin = min.length === 1 ? `0${min}` : min;

      return `${displayHour}:${displayMin} ${ampm}`;
    };

    const parts = timeStr.split(/\s*-\s*|\s+to\s+/i);
    if (parts.length === 2) {
      return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
    }
    
    return timeStr;
  };

  // Sort the classTimes array before mapping so they automatically show in order
  const sortedClassTimes = classTimes 
    ? [...classTimes].sort((a, b) => parseTimeForSort(a.classTime) - parseTimeForSort(b.classTime))
    : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <Mtitle
        title="Class Time Management"
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and organize time slots for your branch
          </span>
        }
        rightcontent={
          <button onClick={openAddModal} className="btn btn-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Time
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
                <th className="py-4 rounded-tl-box">Time Slot Details</th>
                <th className="py-4 text-right rounded-tr-box pr-8">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Reused Skeleton Loader component
                <SkeletonLoader />
              ) : sortedClassTimes?.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-12 text-center">
                    {/* Reused Custom Loading/Empty State Component */}
                    <MtableLoading data={sortedClassTimes} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No time slots found</p>
                      <p className="text-sm">Click "Add New Time" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedClassTimes?.map((ct) => (
                  <tr key={ct._id} className="hover">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="font-bold text-xs">
                                {/* Extract the first hour number for the avatar after formatting */}
                                {formatTimeDisplay(ct.classTime).split(':')[0] || 'T'}
                            </span>
                          </div>
                        </div>
                        <div>
                          {/* Apply formatter here so it always shows beautifully */}
                          <div className="font-semibold text-base">{formatTimeDisplay(ct.classTime)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button
                          onClick={() => openEditModal(ct)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Time"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(ct._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Time"
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
            {editingId ? "Edit Time Slot" : "Create New Time Slot"}
          </h3>

          <form onSubmit={handleSubmit} className="py-2">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Class Time</span>
              </label>
              <input
                type="text"
                name="classTime"
                value={formData.classTime}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g., 10:00 AM - 11:30 AM"
              />
            </div>

            <div className="modal-action mt-6">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Time"}
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