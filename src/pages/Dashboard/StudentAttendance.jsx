import React, { useEffect, useState } from 'react';
import useStudentAttendance from '../../Hook/useStudentAttendance'; 
import useStudents from '../../Hook/useStudents'; 
import useSection from '../../Hook/useSection'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function StudentAttendancePage() {
  // --- Student Attendance Hook ---
  const {
    studentAttendances,
    pagination,
    loading: attendanceLoading,
    error: attendanceError,
    fetchStudentAttendancesByBranch,
    fetchStudentAttendanceById,
    createStudentAttendance, 
    updateStudentAttendance,
    removeStudentAttendance
  } = useStudentAttendance();

  // --- Students Hook ---
  const { 
    students, 
    fetchStudentsByBranch,
    loading: studentsLoading
  } = useStudents();

  // --- Section Hook ---
  const { sections, getSections } = useSection();

  // Local state for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // --- Filter States ---
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  
  const [appliedFilterClass, setAppliedFilterClass] = useState("");
  const [appliedFilterSection, setAppliedFilterSection] = useState("");
  const [appliedFilterDate, setAppliedFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Local state for tracking unsaved inline checkbox selections ---
  const [localStatuses, setLocalStatuses] = useState({});

  // Edit/View Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '', 
    registrationNo: '', 
    studentName: '',
    studentClass: '',
    section: '',
    date: '',
    status: true, // Internal form boolean default
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "student", label: "Student Profile", className: "py-4 rounded-tl-box font-semibold text-base-content" },
    { id: "date", label: "Date", className: "py-4 hidden sm:table-cell font-semibold text-base-content" },
    { id: "classInfo", label: "Class & Section", className: "py-4 hidden md:table-cell font-semibold text-base-content" },
    { id: "present", label: "Present", className: "py-4 text-center font-semibold text-base-content" },
    { id: "absent", label: "Absent", className: "py-4 text-center font-semibold text-base-content" },
    { id: "actions", label: "Action", className: "py-4 text-center rounded-tr-box font-semibold text-base-content pr-8" }
  ];

  useEffect(() => {
    getSections(1, 1000); 
  }, [getSections]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- DYNAMIC SEARCH API IMPLEMENTATION ---
  useEffect(() => {
    fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch);
    fetchStudentAttendancesByBranch(undefined, currentPage, limit, {
      date: appliedFilterDate,
      studentClass: appliedFilterClass,
      section: appliedFilterSection
    });
  }, [fetchStudentsByBranch, fetchStudentAttendancesByBranch, currentPage, limit, debouncedSearch, appliedFilterDate, appliedFilterClass, appliedFilterSection]);

  const uniqueClasses = Array.from(new Set(sections?.map((s) => s.className).filter(Boolean)));
  
  const availableSections = sections
    ?.filter((s) => s.className === formData.studentClass)
    .map((s) => s.sectionName)
    .filter(Boolean);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === 'studentClass') {
        updatedData.section = '';
      }
      return updatedData;
    });
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      registrationNo: '',
      studentName: '',
      studentClass: '',
      section: '',
      date: '',
      status: true,
    });
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleFilterSearch = () => {
    setAppliedFilterClass(filterClass);
    setAppliedFilterSection(filterSection);
    setAppliedFilterDate(filterDate);
    setCurrentPage(1);
  };

  const handleStatusChange = (studentId, newStatus) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  // --- Inline Single Row API Integration (Sends RegistrationNo) ---
  const handleInlineSubmit = async (row) => {
    const currentStatus = localStatuses[row._id] !== undefined ? localStatuses[row._id] : (row.attendanceStatus !== undefined ? row.attendanceStatus : 'Not Marked');
    
    // Evaluate to boolean
    const isPresent = currentStatus === 'Not Marked' ? true : (currentStatus === true || String(currentStatus).toLowerCase() === 'present');

    const payload = {
      studentId: row._id,
      registrationNo: row.registrationNo || '', // Sent to Database based on new model
      studentName: row.studentName || '',
      studentClass: row.studentClass || '',
      section: row.section || '',
      date: appliedFilterDate || new Date().toISOString().split('T')[0],
      attendanceStatus: isPresent ? "Present" : "Absent", 
    };

    setIsSubmitting(true);
    try {
      if (row.attendanceId) {
        await updateStudentAttendance(row.attendanceId, payload);
        if (!isPresent) {
           toast.warning(`Warning: ${row.studentName} updated as Absent.`);
        } else {
           toast.success(`Attendance updated for ${row.studentName}`);
        }
      } else {
        await createStudentAttendance(payload);
        if (!isPresent) {
           toast.warning(`Warning: ${row.studentName} marked as Absent.`);
        } else {
           toast.success(`Attendance marked for ${row.studentName}`);
        }
      }
      
      setLocalStatuses((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });
      fetchStudentAttendancesByBranch(undefined, currentPage, limit, {
        date: appliedFilterDate,
        studentClass: appliedFilterClass,
        section: appliedFilterSection
      });
    } catch (err) {
      toast.error(err.message || "Failed to save attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form Submit (Modal) (Sends RegistrationNo) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isPresent = formData.status === 'true' || formData.status === true || formData.status === 'Present';
      
      const submitData = { 
        studentName: formData.studentName,
        studentId: formData.studentId || editId,
        registrationNo: formData.registrationNo, // Sent to Database based on new model
        studentClass: formData.studentClass,
        section: formData.section,
        date: formData.date,
        attendanceStatus: isPresent ? "Present" : "Absent" 
      };

      if (editId) {
        await updateStudentAttendance(editId, submitData);
        if (!isPresent) {
           toast.warning(`Warning: ${submitData.studentName} updated as Absent.`);
        } else {
           toast.success("Attendance updated successfully!");
        }
      } else {
        await createStudentAttendance(submitData);
        if (!isPresent) {
           toast.warning(`Warning: ${submitData.studentName} marked as Absent.`);
        } else {
           toast.success("Attendance marked successfully!");
        }
      }
      resetForm();
      fetchStudentAttendancesByBranch(undefined, currentPage, limit, {
        date: appliedFilterDate,
        studentClass: appliedFilterClass,
        section: appliedFilterSection
      }); 
    } catch (err) {
      toast.error(err.message || "Failed to save attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = students?.filter((student) => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch = 
        student.studentName?.toLowerCase().includes(lowerSearch) ||
        student.registrationNo?.toLowerCase().includes(lowerSearch) ||
        student.studentClass?.toLowerCase().includes(lowerSearch);
      if (!matchSearch) return false;
    }

    if (appliedFilterClass && student.studentClass !== appliedFilterClass) {
      return false;
    }

    if (appliedFilterSection && student.section !== appliedFilterSection) {
      return false;
    }

    return true;
  }).map(student => {
    const attRecord = studentAttendances?.find(att => {
      const isMatch = att.studentId === student._id || att.registrationNo === student.registrationNo;
      if (appliedFilterDate) {
        const attDate = att.date ? new Date(att.date).toISOString().split('T')[0] : '';
        return isMatch && attDate === appliedFilterDate;
      }
      return isMatch;
    });

    return {
      ...student,
      attendanceId: attRecord?._id || null, 
      date: attRecord?.date || appliedFilterDate || '',
      attendanceStatus: attRecord?.attendanceStatus !== undefined ? attRecord.attendanceStatus : 'Not Marked' 
    };
  });

  const isLoading = attendanceLoading || studentsLoading;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} limit={3} />
      
      <Mtitle 
        title="Student Attendance" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view daily student attendance records.
          </span>
        }
        rightcontent={
          <Link to={"/add-attendance"}>
            <button className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Mark Bulk Attendance
            </button>
          </Link>
        }
      />

      {attendanceError && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex flex-col">
            <span className="font-semibold">Error Loading Data</span>
            <span className="text-sm">{attendanceError}</span>
          </div>
          <button 
            onClick={() => {
              fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch);
              fetchStudentAttendancesByBranch(undefined, currentPage, limit, {
                date: appliedFilterDate,
                studentClass: appliedFilterClass,
                section: appliedFilterSection
              });
            }}
            className="btn btn-sm btn-outline border-white text-white hover:bg-white hover:text-error"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit} 
          onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          
          <div className="form-control w-full sm:max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-base-content">Filter by Date</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full focus:input-primary"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="form-control w-full sm:max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-base-content">Filter by Class</span>
            </label>
            <select 
              className="select select-bordered w-full focus:select-primary"
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilterSection(""); 
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

          {(appliedFilterClass || appliedFilterSection || appliedFilterDate !== new Date().toISOString().split('T')[0]) && (
            <button 
              onClick={() => {
                setFilterClass("");
                setFilterSection("");
                setFilterDate(new Date().toISOString().split('T')[0]);
                setAppliedFilterClass("");
                setAppliedFilterSection("");
                setAppliedFilterDate(new Date().toISOString().split('T')[0]);
                setCurrentPage(1);
              }}
              className="btn btn-ghost text-error"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      <div className="card bg-[#f2f2f2] shadow-xl border border-base-200 p-2">
        <div className="overflow-x-auto rounded-box">
          <table className="table w-full border-separate border-spacing-y-2">
            <thead className="text-base-content text-sm bg-transparent border-none">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header.id} className={header.className}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {isLoading ? (
                <SkeletonLoader />
              ) : filteredData?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center bg-white rounded-xl">
                    <MtableLoading data={filteredData} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-sm">Try adjusting your search criteria or class filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData?.map((row) => {
                  const currentStatus = localStatuses[row._id] !== undefined ? localStatuses[row._id] : (row.attendanceStatus !== undefined ? row.attendanceStatus : 'Not Marked');
                  
                  const isPresent = currentStatus === true || String(currentStatus).toLowerCase() === 'present';
                  const isAbsent = currentStatus === false || String(currentStatus).toLowerCase() === 'absent';

                  return (
                    <tr key={row._id} className="bg-white hover:bg-base-50 shadow-sm rounded-xl">
                      
                      {/* Student Profile Column */}
                      <td className="py-4 rounded-l-xl border-b-0">
                        <div className="flex items-center space-x-3 pl-2">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12 bg-base-200">
                              <img 
                                src={row.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.studentName || 'Student')}&background=random`} 
                                alt={row.studentName || 'Student'} 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-base text-[#1c2c42]">{row.studentName || 'Unknown Student'}</div>
                            <div className="text-xs text-base-content/50 font-medium">ID: {row.registrationNo || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 hidden sm:table-cell border-b-0">
                        <div className="font-medium text-[#1c2c42]">
                          {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      {/* Class & Section Column */}
                      <td className="py-4 hidden md:table-cell border-b-0">
                        <div className="text-sm font-semibold text-[#1c2c42]">{row.studentClass || 'N/A'}</div>
                        <div className="text-xs text-base-content/50">Sec: {row.section || 'N/A'}</div>
                      </td>

                      {/* Present Checkbox Column */}
                      <td className="py-4 text-center border-b-0">
                        <input 
                          type="checkbox" 
                          className={`checkbox rounded-lg ${isPresent ? 'checkbox-success border-success' : 'border-[#6dc22e]'}`} 
                          checked={isPresent}
                          onChange={() => handleStatusChange(row._id, isPresent ? 'Not Marked' : 'Present')}
                        />
                      </td>

                      {/* Absent Checkbox Column */}
                      <td className="py-4 text-center border-b-0">
                        <input 
                          type="checkbox" 
                          className={`checkbox rounded-lg ${isAbsent ? 'checkbox-error border-error bg-error' : 'border-base-300'}`} 
                          checked={isAbsent}
                          onChange={() => handleStatusChange(row._id, isAbsent ? 'Not Marked' : 'Absent')}
                        />
                      </td>

                      {/* Actions Column (Submit Button) */}
                      <td className="py-4 text-center rounded-r-xl border-b-0 pr-6">
                        <button 
                          onClick={() => handleInlineSubmit(row)}
                          disabled={isSubmitting}
                          className="btn btn-sm bg-[#6dc22e] hover:bg-[#5aa426] border-none text-white font-medium min-w-[80px]"
                        >
                          {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
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

      {/* --- EDIT/CREATE ATTENDANCE MODAL --- */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            {editId ? 'Edit Attendance Record' : 'Mark Attendance'}
          </h3>

          <form onSubmit={handleSubmit} className="py-2 space-y-3">
            <div className="flex gap-4">
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
                  readOnly
                  className="input input-bordered w-full focus:input-primary bg-base-200 cursor-not-allowed"
                />
              </div>

              {/* Added Registration No field to Modal for completeness */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Registration No</span>
                </label>
                <input 
                  type="text" 
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleInputChange}
                  required
                  readOnly={!!editId} // Typically read-only if modifying existing data
                  className={`input input-bordered w-full focus:input-primary ${editId ? 'bg-base-200 cursor-not-allowed' : ''}`}
                />
              </div>
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

            <div className="flex gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Date</span>
                </label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Status</span>
                </label>
                <select 
                  name="status"
                  value={String(formData.status)}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value === 'true'}))}
                  className="select select-bordered w-full focus:select-primary"
                >
                  <option value="true">Present</option>
                  <option value="false">Absent</option>
                </select>
              </div>
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

      {/* --- VIEW ATTENDANCE MODAL --- */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Attendance Details
          </h3>
          
          {viewData && (
            <div className="flex flex-col items-center py-4">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img 
                    src={viewData.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewData.studentName || 'Student')}&background=random`} 
                    alt={viewData.studentName} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mb-1">{viewData.studentName || 'Unknown Student'}</h3>
              <div className="badge badge-primary badge-outline font-medium mb-6 px-4 py-3">
                Class {viewData.studentClass || viewData.className} - Sec {viewData.section || viewData.sectionName}
              </div>
              
              <div className="w-full bg-base-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Date:</span>
                  <span className="text-base-content font-medium">
                    {viewData.date ? new Date(viewData.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Status:</span>
                  <div className={`badge ${
                        (viewData.attendanceStatus?.toString().toLowerCase() === 'present') ? 'badge-success text-white' : 
                        (viewData.attendanceStatus?.toString().toLowerCase() === 'absent') ? 'badge-error text-white' : 
                        'badge-ghost'
                      } font-medium`}>
                    {(viewData.attendanceStatus?.toString().toLowerCase() === 'present') ? 'Present' : 
                     (viewData.attendanceStatus?.toString().toLowerCase() === 'absent') ? 'Absent' : 
                     'Not Marked'}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Student ID:</span>
                  <span className="text-base-content">{viewData.registrationNo || viewData.studentId || 'N/A'}</span>
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