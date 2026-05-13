import React, { useEffect, useState } from 'react';
import useEmployees from '../../Hook/useEmployees'; // Adjust path as necessary
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Import your reusable components (Adjust the paths according to your project structure)
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function EmployeeList() {
  // --- Employee Hook ---
  const {
    employees,
    pagination,
    loading,
    error,
    fetchEmployeesByBranch,
    fetchEmployeeById,
    removeEmployee,
    updateEmployee
  } = useEmployees();

  // Local state for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // --- NEW: Filter State ---
  const [filterRole, setFilterRole] = useState("");

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // FIXED: Updated state keys to match your database schema exactly
  const [formData, setFormData] = useState({
    employeeName: '',
    emailAddress: '',
    employeeRole: '',
    mobileNo: '',
  });

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "employee", label: "Employee Profile", className: "py-4 rounded-tl-box" },
    { id: "email", label: "Email Address", className: "py-4 hidden sm:table-cell" },
    { id: "roleInfo", label: "Role", className: "py-4 hidden md:table-cell" },
    { id: "contact", label: "Contact Info", className: "py-4 hidden lg:table-cell" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // --- Extract Unique Roles ---
  const uniqueRoles = Array.from(new Set(
    employees?.map((emp) => emp.employeeRole || emp.role).filter(Boolean)
  ));

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch employees
  useEffect(() => {
    fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch);
  }, [fetchEmployeesByBranch, currentPage, limit, debouncedSearch]);

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
    // FIXED: Resetting to the correct database keys
    setFormData({
      employeeName: '',
      emailAddress: '',
      employeeRole: '',
      mobileNo: '',
    });
    setEditId(null);
    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await removeEmployee(id);
        toast.success("Employee deleted successfully!");
        if (employees.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          // ADDED AWAIT: Ensures data is fetched before moving on
          await fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch);
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete employee.");
      }
    }
  };

  // Handle View Button Click
  const handleViewClick = async (id) => {
    try {
      const fetchedEmployee = await fetchEmployeeById(id);
      const data = fetchedEmployee?.data || fetchedEmployee;
      if (data) {
        setViewData(data);
        setIsViewModalOpen(true);
      } else {
        toast.error("Could not load employee data for viewing.");
      }
    } catch (err) {
      toast.error("Failed to fetch employee details.");
    }
  };

  // Handle Edit Button Click
  const handleEditClick = async (id) => {
    try {
      const fetchedEmployee = await fetchEmployeeById(id);
      const data = fetchedEmployee?.data || fetchedEmployee;

      if (data) {
        // FIXED: Mapping to the correct state keys based on DB structure
        setFormData({
          employeeName: data.employeeName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || '',
          emailAddress: data.emailAddress || data.email || '',
          employeeRole: data.employeeRole || data.role || '',
          mobileNo: data.mobileNo || data.phone || '',
        });
        setEditId(data._id || id);
        setIsModalOpen(true);
      } else {
        toast.error("Could not load employee data for editing.");
      }
    } catch (err) {
      toast.error("Failed to fetch employee details.");
    }
  };

  // Handle Edit Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Send the update request to the API
      await updateEmployee(editId, formData);
      
      // 2. AWAIT the fetch call so the table data updates in the background before closing
      await fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch); 
      
      // 3. Show success and close modal
      toast.success("Employee updated successfully!");
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to update employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local filtering combining Search and Role Filter
  const filteredEmployees = employees?.filter((employee) => {
    // 1. Check Role filter
    if (filterRole) {
      const role = employee.employeeRole || employee.role;
      if (role !== filterRole) return false;
    }

    // 2. Check general search term
    if (!searchTerm) return true;
    
    const lowerSearch = searchTerm.toLowerCase();
    const empName = employee.employeeName || employee.name || `${employee.firstName} ${employee.lastName}`;
    
    return (
      empName?.toLowerCase().includes(lowerSearch) ||
      employee.emailAddress?.toLowerCase().includes(lowerSearch) ||
      employee.email?.toLowerCase().includes(lowerSearch) ||
      employee.employeeRole?.toLowerCase().includes(lowerSearch) ||
      employee.role?.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <Mtitle 
        title="Employee List" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view all staff members.
          </span>
        }
        rightcontent={
          <Link to={"/employee"}> 
            <button className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Employee
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
            <span className="font-semibold">Error Loading Employees</span>
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch)}
            className="btn btn-sm btn-outline border-white text-white hover:bg-white hover:text-error"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table Controls (Search, Limit & Filter) */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit} 
          onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* --- NEW: Role Filter Dropdown --- */}
        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
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
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>

          {(filterRole || searchTerm) && (
            <button 
              onClick={() => {
                setFilterRole("");
                setSearchTerm("");
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
              {loading ? (
                <SkeletonLoader />
              ) : filteredEmployees?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={filteredEmployees} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm">Try adjusting your search criteria or filters, or add new employees.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees?.map((employee) => {
                  const employeeName = employee.employeeName || employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                  
                  return (
                  <tr key={employee._id} className="hover">
                    
                    {/* Employee Profile Column */}
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-200">
                            <img 
                              src={employee.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=random`} 
                              alt={employeeName} 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                            />
                          </div>
                        </div>
                       
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="py-4 hidden sm:table-cell">
                      <div className="text-sm font-medium">
                        {employee.emailAddress || employee.email || 'N/A'}
                      </div>
                    </td>

                    {/* Role & Branch Column */}
                    <td className="py-4 hidden md:table-cell">
                      <div className="text-sm font-medium capitalize">{employee.employeeRole || employee.role || 'N/A'}</div>
                    </td>

                    {/* Contact Column */}
                    <td className="py-4 hidden lg:table-cell">
                      <div className="text-sm font-medium">{employee.mobileNo || employee.phone || 'No Number'}</div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 text-right pr-6">
                      <div className="join justify-end">
                        <button 
                          onClick={() => handleViewClick(employee._id)}
                          className="btn btn-sm btn-ghost text-success join-item"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">View</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(employee._id)}
                          className="btn btn-sm btn-ghost text-info join-item"
                          title="Edit Employee"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(employee._id)}
                          className="btn btn-sm btn-ghost text-error join-item"
                          title="Delete Employee"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
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

      {/* --- EDIT EMPLOYEE MODAL (DaisyUI) --- */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Edit Employee Details
          </h3>

          <form onSubmit={handleSubmit} className="py-2 space-y-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Full Name</span>
              </label>
              {/* FIXED: name attribute changed to employeeName */}
              <input 
                type="text" 
                name="employeeName"
                value={formData.employeeName} 
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Email Address</span>
              </label>
              {/* FIXED: name attribute changed to emailAddress */}
              <input 
                type="email" 
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                required
                className="input input-bordered w-full focus:input-primary"
              />
            </div>

            <div className="flex gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Role</span>
                </label>
                {/* FIXED: name attribute changed to employeeRole */}
                <input 
                  type="text" 
                  name="employeeRole"
                  value={formData.employeeRole}
                  onChange={handleInputChange}
                  placeholder="e.g. Teacher, Admin"
                  required
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Contact Number</span>
                </label>
                <input 
                  type="text" 
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  className="input input-bordered w-full focus:input-primary"
                />
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

      {/* --- VIEW EMPLOYEE MODAL (DaisyUI) --- */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          
          <h3 className="font-bold text-xl mb-4 border-b border-base-200 pb-2">
            Employee Profile
          </h3>
          
          {viewData && (
            <div className="flex flex-col items-center py-4">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img 
                    src={viewData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewData.name || viewData.employeeName || viewData.firstName)}&background=random`} 
                    alt={viewData.name || viewData.employeeName} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mb-1">
                {viewData.employeeName || viewData.name || `${viewData.firstName || ''} ${viewData.lastName || ''}`.trim()}
              </h3>
              <div className="badge badge-primary badge-outline font-medium mb-6 px-4 py-3 capitalize">
                {viewData.employeeRole || viewData.role || 'Staff Member'}
              </div>
              
              <div className="w-full bg-base-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Email:</span>
                  <span className="text-base-content">{viewData.emailAddress || viewData.email || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Phone:</span>
                  <span className="text-base-content">{viewData.mobileNo || viewData.phone || 'N/A'}</span>
                </div>
                {/* <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Branch:</span>
                  <span className="text-base-content">{viewData.branch || 'N/A'}</span>
                </div> */}
                <div className="flex items-center">
                  <span className="font-semibold text-base-content/70 w-28">Status:</span>
                  <span className={`badge ${viewData.isActive !== false ? 'badge-success' : 'badge-error'} badge-sm`}>
                    {viewData.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
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