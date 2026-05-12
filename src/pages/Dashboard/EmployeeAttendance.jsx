import React, { useEffect, useState } from 'react';
import useEmployeeAttendance from '../../Hook/useEmployeeAttendance'; 
import useEmployees from '../../Hook/useEmployees'; // Assuming you have a hook to fetch employees
import useEmployeeRole from '../../Hook/useEmployeeRole'; // Imported the Role Hook
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function EmployeeAttendance() {
  // --- Employee Attendance Hook ---
  const {
    employeeAttendances,
    pagination,
    loading: attendanceLoading,
    error: attendanceError,
    fetchEmployeeAttendancesByBranch,
    createEmployeeAttendance, 
    updateEmployeeAttendance
  } = useEmployeeAttendance();

  // --- Employees Hook ---
  const { 
    employees, 
    fetchEmployeesByBranch,
    loading: employeesLoading
  } = useEmployees();

  // --- Employee Role Hook (Added for Dynamic Dropdown) ---
  const {
    employeeRoles,
    getEmployeeRolesByBranch
  } = useEmployeeRole();

  // Local state for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // --- Filter States ---
  const [filterRole, setFilterRole] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  
  const [appliedFilterRole, setAppliedFilterRole] = useState("");
  const [appliedFilterDate, setAppliedFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Local state for tracking unsaved inline checkbox selections ---
  const [localStatuses, setLocalStatuses] = useState({});

  // Edit/View Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', 
    employeeName: '',
    employeeRole: '',
    employeeMobileNo: '', // Added mobile number
    date: '',
    status: true, // Internal form boolean default
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "employee", label: "Employee Profile", className: "py-4 rounded-tl-box font-semibold text-base-content" },
    { id: "mobileNo", label: "Mobile No", className: "py-4 font-semibold text-base-content" }, // Added mobile number header
    { id: "date", label: "Date", className: "py-4 hidden sm:table-cell font-semibold text-base-content" },
    { id: "role", label: "Role", className: "py-4 hidden md:table-cell font-semibold text-base-content" },
    { id: "present", label: "Present", className: "py-4 text-center font-semibold text-base-content" },
    { id: "absent", label: "Absent", className: "py-4 text-center font-semibold text-base-content" },
    { id: "actions", label: "Action", className: "py-4 text-center rounded-tr-box font-semibold text-base-content pr-8" }
  ];

  // Fetch dynamic roles for the dropdown on component mount
  useEffect(() => {
    getEmployeeRolesByBranch(1, 100); 
  }, [getEmployeeRolesByBranch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- DYNAMIC SEARCH API IMPLEMENTATION ---
  useEffect(() => {
    // Fetch employees for the base list
    fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch);
    
    // Fetch attendance records to overlay on the employee list
    fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, {
      date: appliedFilterDate,
      employeeRole: appliedFilterRole
    });
  }, [fetchEmployeesByBranch, fetchEmployeeAttendancesByBranch, currentPage, limit, debouncedSearch, appliedFilterDate, appliedFilterRole]);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      employeeRole: '',
      employeeMobileNo: '',
      date: '',
      status: true,
    });
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleFilterSearch = () => {
    setAppliedFilterRole(filterRole);
    setAppliedFilterDate(filterDate);
    setCurrentPage(1);
  };

  const handleStatusChange = (employeeId, newStatus) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [employeeId]: newStatus
    }));
  };

  // --- Inline Single Row API Integration ---
  const handleInlineSubmit = async (row) => {
    // Using row.status instead of row.attendanceStatus
    const currentStatus = localStatuses[row._id] !== undefined ? localStatuses[row._id] : (row.status !== undefined ? row.status : 'Not Marked');
    
    // Evaluate to strict "Present" or "Absent" per schema Enum
    const isPresent = currentStatus === 'Not Marked' ? true : (currentStatus === true || String(currentStatus).toLowerCase() === 'present');

    // Make sure we securely grab the mobile number from the row object
    const empMobile = row.employeeMobileNo || row.mobileNo || row.phone || 'N/A';

    const payload = {
      employeeId: row._id,
      employeeName: row.employeeName || row.name || 'Unknown',
      employeePhoto: row.employeePhoto || row.photo || '',
      employeeRole: row.employeeRole || row.role || 'Staff',
      employeeMobileNo: empMobile, 
      date: appliedFilterDate || new Date().toISOString().split('T')[0],
      status: isPresent ? "Present" : "Absent", // CHANGED TO status
    };

    setIsSubmitting(true);
    try {
      if (row.attendanceId) {
        await updateEmployeeAttendance(row.attendanceId, payload);
        if (!isPresent) {
           toast.warning(`Warning: ${row.employeeName || row.name} updated as Absent.`);
        } else {
           toast.success(`Attendance updated for ${row.employeeName || row.name}`);
        }
      } else {
        await createEmployeeAttendance(payload);
        if (!isPresent) {
           toast.warning(`Warning: ${row.employeeName || row.name} marked as Absent.`);
        } else {
           toast.success(`Attendance marked for ${row.employeeName || row.name}`);
        }
      }
      
      setLocalStatuses((prev) => {
        const newState = { ...prev };
        delete newState[row._id];
        return newState;
      });
      fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, {
        date: appliedFilterDate,
        employeeRole: appliedFilterRole
      });
    } catch (err) {
      toast.error(err.message || "Failed to save attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form Submit (Modal) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isPresent = formData.status === 'true' || formData.status === true || formData.status === 'Present';
      
      const submitData = { 
        employeeName: formData.employeeName,
        employeeId: formData.employeeId || editId,
        employeeRole: formData.employeeRole,
        employeeMobileNo: formData.employeeMobileNo || 'N/A', // Passing mobile number
        date: formData.date,
        status: isPresent ? "Present" : "Absent" // CHANGED TO status
      };

      if (editId) {
        await updateEmployeeAttendance(editId, submitData);
        if (!isPresent) {
           toast.warning(`Warning: ${submitData.employeeName} updated as Absent.`);
        } else {
           toast.success("Attendance updated successfully!");
        }
      } else {
        await createEmployeeAttendance(submitData);
        if (!isPresent) {
           toast.warning(`Warning: ${submitData.employeeName} marked as Absent.`);
        } else {
           toast.success("Attendance marked successfully!");
        }
      }
      resetForm();
      fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, {
        date: appliedFilterDate,
        employeeRole: appliedFilterRole
      }); 
    } catch (err) {
      toast.error(err.message || "Failed to save attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merge employee data with attendance status for the current date
  const filteredData = employees?.filter((employee) => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch = 
        employee.employeeName?.toLowerCase().includes(lowerSearch) ||
        employee.name?.toLowerCase().includes(lowerSearch) ||
        employee.employeeRole?.toLowerCase().includes(lowerSearch) ||
        employee.role?.toLowerCase().includes(lowerSearch);
      if (!matchSearch) return false;
    }

    const empRole = employee.employeeRole || employee.role;
    if (appliedFilterRole && empRole !== appliedFilterRole) {
      return false;
    }

    return true;
  }).map(employee => {
    const attRecord = employeeAttendances?.find(att => {
      const isMatch = att.employeeId === employee._id;
      if (appliedFilterDate) {
        const attDate = att.date ? new Date(att.date).toISOString().split('T')[0] : '';
        return isMatch && attDate === appliedFilterDate;
      }
      return isMatch;
    });

    return {
      ...employee,
      attendanceId: attRecord?._id || null, 
      date: attRecord?.date || appliedFilterDate || '',
      // Ensuring we prioritize the attendance record's mobile No, but fall back to the employee table's if missing
      employeeMobileNo: attRecord?.employeeMobileNo || employee.employeeMobileNo || employee.mobileNo || employee.phone || 'N/A',
      status: attRecord?.status !== undefined ? attRecord.status : 'Not Marked' // CHANGED TO status
    };
  });

  const isLoading = attendanceLoading || employeesLoading;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} limit={3} />
      
      <Mtitle 
        title="Employee Attendance" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view daily employee attendance records.
          </span>
        }
        rightcontent={
          <Link to={"/add-employee-attendance"}>
            <button className="btn btn-primary bg-[#6dc22e] hover:bg-[#5aa426] border-none shadow-sm text-white">
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
              fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch);
              fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, {
                date: appliedFilterDate,
                employeeRole: appliedFilterRole
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
              <span className="label-text font-semibold text-base-content">Filter by Role</span>
            </label>
            <select 
              className="select select-bordered w-full focus:select-primary"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {/* Dynamically mapped roles from useEmployeeRole hook */}
              {employeeRoles?.map((role) => (
                <option key={role._id} value={role.roleName || role.name}>
                  {role.roleName || role.name}
                </option>
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

          {(appliedFilterRole || appliedFilterDate !== new Date().toISOString().split('T')[0]) && (
            <button 
              onClick={() => {
                setFilterRole("");
                setFilterDate(new Date().toISOString().split('T')[0]);
                setAppliedFilterRole("");
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

      <div className="card bg-[#f2f2f2] shadow-sm border border-base-200 p-2">
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
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm">Try adjusting your search criteria or role filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData?.map((row) => {
                  const currentStatus = localStatuses[row._id] !== undefined ? localStatuses[row._id] : (row.status !== undefined ? row.status : 'Not Marked'); // CHANGED TO status
                  
                  const isPresent = currentStatus === true || String(currentStatus).toLowerCase() === 'present';
                  const isAbsent = currentStatus === false || String(currentStatus).toLowerCase() === 'absent';

                  const empName = row.employeeName || row.name || 'Unknown';
                  const empRole = row.employeeRole || row.role || 'Staff';
                  const empMobile = row.employeeMobileNo || row.mobileNo || row.phone || 'N/A';

                  return (
                    <tr key={row._id} className="bg-white hover:bg-base-50 shadow-sm rounded-xl">
                      
                      {/* Employee Profile Column */}
                      <td className="py-4 rounded-l-xl border-b-0">
                        <div className="flex items-center space-x-3 pl-2">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12 bg-base-200">
                              <img 
                                src={row.employeePhoto || row.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=random`} 
                                alt={empName} 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-base text-[#1c2c42]">{empName}</div>
                            <div className="text-xs text-base-content/50 font-medium">ID: {row.employeeId || row._id.substring(row._id.length - 6)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Mobile Number Column - NEW */}
                      <td className="py-4 border-b-0">
                        <div className="text-sm font-medium text-[#1c2c42]">{empMobile}</div>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 hidden sm:table-cell border-b-0">
                        <div className="font-medium text-[#1c2c42]">
                          {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 hidden md:table-cell border-b-0">
                        <div className="text-sm font-semibold text-[#1c2c42]">{empRole}</div>
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
                          className="btn btn-sm bg-[#6dc22e] hover:bg-[#5aa426] border-none text-white font-medium min-w-[80px] rounded-lg shadow-sm"
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
                  <span className="label-text font-semibold text-base-content">Employee Name</span>
                </label>
                <input 
                  type="text" 
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="input input-bordered w-full focus:input-primary bg-base-200 cursor-not-allowed"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Employee Role</span>
                </label>
                <input 
                  type="text" 
                  name="employeeRole"
                  value={formData.employeeRole}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="input input-bordered w-full focus:input-primary bg-base-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Mobile No</span>
                </label>
                <input 
                  type="text" 
                  name="employeeMobileNo"
                  value={formData.employeeMobileNo}
                  onChange={handleInputChange}
                  readOnly
                  className="input input-bordered w-full focus:input-primary bg-base-200 cursor-not-allowed"
                />
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
                    src={viewData.employeePhoto || viewData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewData.employeeName || 'Employee')}&background=random`} 
                    alt={viewData.employeeName} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mb-1">{viewData.employeeName || viewData.name || 'Unknown Employee'}</h3>
              <div className="badge badge-primary badge-outline font-medium mb-6 px-4 py-3">
                {viewData.employeeRole || viewData.role || 'Staff'}
              </div>
              
              <div className="w-full bg-base-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Mobile No:</span>
                  <span className="text-base-content font-medium">
                    {viewData.employeeMobileNo || viewData.mobileNo || viewData.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Date:</span>
                  <span className="text-base-content font-medium">
                    {viewData.date ? new Date(viewData.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Status:</span>
                  <div className={`badge ${
                        (viewData.status?.toString().toLowerCase() === 'present') ? 'badge-success text-white' :  // CHANGED TO status
                        (viewData.status?.toString().toLowerCase() === 'absent') ? 'badge-error text-white' :     // CHANGED TO status
                        'badge-ghost'
                      } font-medium`}>
                    {(viewData.status?.toString().toLowerCase() === 'present') ? 'Present' : 
                     (viewData.status?.toString().toLowerCase() === 'absent') ? 'Absent' : 
                     'Not Marked'}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Employee ID:</span>
                  <span className="text-base-content">{viewData.employeeId || viewData._id || 'N/A'}</span>
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