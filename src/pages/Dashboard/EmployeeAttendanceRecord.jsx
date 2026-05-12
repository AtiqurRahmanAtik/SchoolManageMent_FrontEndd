import React, { useEffect, useState } from 'react';
import { useEmployeeAttendance } from '../../Hook/useEmployeeAttendance'; // Adjust path if needed
import useEmployeeRole from '../../Hook/useEmployeeRole'; // Imported the Role Hook
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Import your reusable components (Adjust the paths according to your project structure)
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function EmployeeAttendanceRecord() {
  // --- Attendance Hook ---
  const {
    employeeAttendances,
    pagination,
    loading,
    error,
    fetchEmployeeAttendancesByBranch
  } = useEmployeeAttendance();

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
  const [filterDate, setFilterDate] = useState(""); 
  
  const [appliedFilterRole, setAppliedFilterRole] = useState("");
  const [appliedFilterDate, setAppliedFilterDate] = useState(""); 

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "employee", label: "Employee Profile", className: "py-4 rounded-tl-box" },
    { id: "date", label: "Date", className: "py-4" }, 
    { id: "roleInfo", label: "Role & Mobile No", className: "py-4 hidden md:table-cell" },
    { id: "status", label: "Status", className: "py-4 rounded-tr-box pr-8 text-right" }
  ];

  // Fetch dynamic roles for the dropdown on component mount
  useEffect(() => {
    // Fetching up to 100 roles to ensure the dropdown is fully populated
    getEmployeeRolesByBranch(1, 100); 
  }, [getEmployeeRolesByBranch]);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch employee attendances (Backend Integration for Search & Filters)
  useEffect(() => {
    const filters = {};
    
    // Explicitly mapping to what the hook expects
    if (appliedFilterRole) {
      filters.employeeRole = appliedFilterRole;
    }
    if (appliedFilterDate) {
      filters.date = appliedFilterDate; 
    }
    if (debouncedSearch) {
      filters.search = debouncedSearch; 
    }

    // Fetch the data whenever page, limit, search, or applied filters change
    fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, filters);
  }, [fetchEmployeeAttendancesByBranch, currentPage, limit, debouncedSearch, appliedFilterRole, appliedFilterDate]);

  // Pagination & Control Handlers
  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFilterSearch = () => {
    setAppliedFilterRole(filterRole);
    setAppliedFilterDate(filterDate); 
    setCurrentPage(1); // Reset to page 1 on new filter
  };

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to render status badges dynamically
  const renderStatusBadge = (record) => {
    if (!record) return <div className="badge badge-ghost font-medium px-4 py-3">Unknown</div>;

    const statusValue = record.attendanceStatus || record.status;

    if (typeof statusValue === 'string') {
      const statusFormatted = statusValue.toLowerCase();
      if (statusFormatted === 'present') {
        return <div className="badge badge-success text-white font-medium px-6 py-3 rounded-full">Present</div>;
      }
      if (statusFormatted === 'absent') {
        return <div className="badge badge-error text-white font-medium px-6 py-3 rounded-full">Absent</div>;
      }
      if (statusFormatted === 'late') {
        return <div className="badge badge-warning text-white font-medium px-6 py-3 rounded-full">Late</div>;
      }
      return <div className="badge badge-ghost font-medium px-6 py-3 capitalize rounded-full">{statusValue}</div>;
    }

    if (record.present === true) return <div className="badge badge-success text-white font-medium px-6 py-3 rounded-full">Present</div>;
    if (record.absent === true) return <div className="badge badge-error text-white font-medium px-6 py-3 rounded-full">Absent</div>;

    if (typeof statusValue === 'boolean') {
      return (
        <div className={`badge ${statusValue ? 'badge-success' : 'badge-error'} text-white font-medium px-6 py-3 rounded-full`}>
          {statusValue ? 'Present' : 'Absent'}
        </div>
      );
    }

    return <div className="badge badge-ghost font-medium px-6 py-3 capitalize rounded-full">Not Marked</div>;
  };

  // Helper for generating initials placeholder backgrounds dynamically based on UI
  const getAvatarColor = (name) => {
    const colors = ["bg-green-200 text-green-800", "bg-emerald-600 text-white", "bg-base-200 text-base-content"];
    const index = name ? name.charCodeAt(0) % colors.length : 2;
    return colors[index];
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <Mtitle 
        title="Employee Attendance Records" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view daily employee attendance history.
          </span>
        }
        rightcontent={
          <Link to={"/attendance/employee"}>
            <button className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Take Attendance
            </button>
          </Link>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex flex-col">
            <span className="font-semibold">Error Loading Attendance</span>
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => {
              const filters = {};
              if (appliedFilterRole) filters.employeeRole = appliedFilterRole;
              if (appliedFilterDate) filters.date = appliedFilterDate;
              if (debouncedSearch) filters.search = debouncedSearch;
              fetchEmployeeAttendancesByBranch(undefined, currentPage, limit, filters);
            }}
            className="btn btn-sm btn-outline border-white text-white hover:bg-white hover:text-error"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table Controls & Filter Section */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit} 
          onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* Filters + Search Button */}
        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          
          {/* Date Filter */}
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

          {/* Dynamic Role Filter */}
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
              {/* Dynamically mapping roles from the backend */}
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

          {(appliedFilterRole || appliedFilterDate) && (
            <button 
              onClick={() => {
                setFilterRole("");
                setFilterDate("");
                setAppliedFilterRole("");
                setAppliedFilterDate("");
                setCurrentPage(1);
              }}
              className="btn btn-ghost text-error"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Main Table Card */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="overflow-x-auto rounded-box">
          <table className="table w-full border-separate border-spacing-y-2 px-2">
            <thead className="bg-base-200 text-base-content text-sm">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header.id} className={`bg-base-200 border-none ${header.className}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <SkeletonLoader />
              ) : employeeAttendances?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center bg-base-100">
                    <MtableLoading data={employeeAttendances} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No attendance records found</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employeeAttendances?.map((record) => {
                  // Fallbacks for flat vs populated API payloads
                  const employeeName = record.employeeName || record.employee?.employeeName || "Unknown Employee";
                  const employeePhoto = record.employeePhoto || record.employee?.employeePhoto;
                  const employeeRole = record.employeeRole || record.employee?.employeeRole || "N/A";
                  const mobileNo = record.employeeMobileNo || record.employee?.mobileNo || record.employee?.employeeMobileNo || "N/A";
                  const regNo = record.registrationNo || record.employee?.registrationNo || record.employee?.employeeId || record.employeeId || "N/A";
                  

                  // Safe fallback to match backend date logic
                  const attendanceDate = record.date || record.attendanceDate || record.createdAt;
                  
                  // Get initials for avatar (e.g., "MI" for "Mitu")
                  const initials = employeeName.substring(0, 2).toUpperCase();



                  return (
                    <tr key={record._id} className="hover bg-base-100 shadow-sm rounded-xl">
                      
                      {/* Employee Profile Column */}
                      <td className="py-4 bg-white rounded-l-xl border-y border-l border-base-200">
                        <div className="flex items-center space-x-4 ml-2">
                          <div className="avatar placeholder">
                            {employeePhoto ? (
                              <div className="mask mask-squircle w-12 h-12">
                                <img src={employeePhoto} alt={employeeName} onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}/>
                              </div>
                            ) : (
                              <div className={`mask mask-squircle w-12 h-12 flex items-center justify-center font-bold text-lg ${getAvatarColor(employeeName)}`}>
                                <span>{initials}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-base text-base-content">{employeeName}</div>
                            <div className="text-xs text-base-content/60 mt-0.5">Emp No: {regNo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date Column - Now explicitly visible everywhere */}
                      <td className="py-4 bg-white border-y border-base-200">
                        <div className="text-sm font-medium text-base-content/80">
                          {formatDate(attendanceDate)}
                        </div>
                      </td>

                      {/* Role & Mobile No Column */}
                      <td className="py-4 hidden md:table-cell bg-white border-y border-base-200">
                        <div className="text-sm font-medium text-base-content/80">{employeeRole}</div>
                        <div className="text-xs text-base-content/60 mt-0.5">Mob: {mobileNo}</div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 pr-6 text-right bg-white rounded-r-xl border-y border-r border-base-200">
                        {renderStatusBadge(record)}
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {!loading && pagination && pagination.totalPages > 1 && (
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

    </div>
  );
}