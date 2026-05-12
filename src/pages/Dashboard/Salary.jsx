import React, { useEffect, useState } from 'react';
import useEmployees from '../../Hook/useEmployees'; // Reusing your existing hook
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Reusable Components
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function Salary() {
  // --- Employee Hook ---
  const {
    employees,
    pagination,
    loading,
    error,
    fetchEmployeesByBranch,
    fetchEmployeeById,
    updateEmployee
  } = useEmployees();

  // Local state for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // Filter State
  const [filterRole, setFilterRole] = useState("");

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // FIXED: Updated state keys to match your image data (monthlySalary)
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeRole: '',
    monthlySalary: '', 
  });

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Table Headers ---
  const tableHeaders = [
    { id: "employee", label: "Employee Name", className: "py-4 rounded-tl-box pl-6" },
    { id: "role", label: "Designation", className: "py-4 hidden sm:table-cell" },
    { id: "salary", label: "Monthly Salary", className: "py-4" }, // Salary is now explicit
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Extract Unique Roles for the Dropdown filter
  const uniqueRoles = Array.from(new Set(
    employees?.map((emp) => emp.employeeRole || emp.role).filter(Boolean)
  ));

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Data
  useEffect(() => {
    fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch);
  }, [fetchEmployeesByBranch, currentPage, limit, debouncedSearch]);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ employeeName: '', employeeRole: '', monthlySalary: '' });
    setEditId(null);
    setIsModalOpen(false);
  };

  // Handle View
  const handleViewClick = async (id) => {
    try {
      const fetched = await fetchEmployeeById(id);
      const data = fetched?.data || fetched;
      if (data) {
        setViewData(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to fetch details.");
    }
  };

  // Handle Edit Salary
  const handleEditClick = async (id) => {
    try {
      const fetched = await fetchEmployeeById(id);
      const data = fetched?.data || fetched;
      if (data) {
        // FIXED: Mapping monthlySalary from your data image
        setFormData({
          employeeName: data.employeeName || '',
          employeeRole: data.employeeRole || '',
          monthlySalary: data.monthlySalary || '', 
        });
        setEditId(data._id || id);
        setIsModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to fetch salary data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateEmployee(editId, formData);
      await fetchEmployeesByBranch(undefined, currentPage, limit, debouncedSearch); 
      toast.success("Salary updated successfully!");
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to update salary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredEmployees = employees?.filter((employee) => {
    if (filterRole && (employee.employeeRole || employee.role) !== filterRole) return false;
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const name = (employee.employeeName || "").toLowerCase();
    return name.includes(lowerSearch);
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Mtitle 
        title="Salary Management" 
        middlecontent={<span className="text-sm text-base-content/70 hidden md:inline-block">Manage employee payroll and designation salaries.</span>}
        rightcontent={
          <div className="badge badge-primary badge-outline p-4 font-semibold">
            Records: {pagination?.totalItems || 0}
          </div>
        }
      />

      {/* Controls Section */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit} 
          onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          <div className="form-control w-full sm:max-w-xs">
            <label className="label"><span className="label-text font-semibold">Filter by Role</span></label>
            <select 
              className="select select-bordered w-full"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>
          {(filterRole || searchTerm) && (
            <button onClick={() => { setFilterRole(""); setSearchTerm(""); }} className="btn btn-ghost text-error">Clear Filters</button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="overflow-x-auto rounded-box">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content text-sm">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header.id} className={header.className}>{header.label}</th>
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
                  </td>
                </tr>
              ) : (
                filteredEmployees?.map((employee) => (
                  <tr key={employee._id} className="hover">
                    <td className="py-4 pl-6 font-medium text-base-content">{employee.employeeName}</td>
                    <td className="py-4 hidden sm:table-cell capitalize">{employee.employeeRole || 'N/A'}</td>
                    {/* FIXED: Displaying monthlySalary from your image data */}
                    <td className="py-4 font-bold text-primary">
                      {employee.monthlySalary ? `৳ ${employee.monthlySalary.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="join">
                        <button onClick={() => handleViewClick(employee._id)} className="btn btn-sm btn-ghost text-success join-item">View</button>
                        <button onClick={() => handleEditClick(employee._id)} className="btn btn-sm btn-ghost text-info join-item">Update</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center md:justify-end mt-6">
          <Pagination 
            currentPage={currentPage} 
            totalPages={pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}

      {/* Update Salary Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4 border-b pb-2">Edit Salary: {formData.employeeName}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Monthly Salary</span></label>
              <input 
                type="number" 
                name="monthlySalary" 
                value={formData.monthlySalary} 
                onChange={handleInputChange} 
                placeholder="Enter new salary"
                required 
                className="input input-bordered w-full focus:input-primary" 
              />
            </div>
            <div className="modal-action">
              <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary min-w-[120px]">
                {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={resetForm}><button>close</button></div>
      </div>

      {/* View Modal */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4 border-b pb-2">Employee Salary Details</h3>
          {viewData && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <img src={viewData.photo || `https://ui-avatars.com/api/?name=${viewData.employeeName}`} alt="Profile" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold">{viewData.employeeName}</h4>
                  <p className="text-sm opacity-70">{viewData.employeeRole}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-xs uppercase font-bold opacity-60">Monthly Salary</p>
                  <p className="text-xl font-bold text-primary">৳ {viewData.monthlySalary || 0}</p>
                </div>
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-xs uppercase font-bold opacity-60">Experience</p>
                  <p className="text-lg font-semibold">{viewData.experience || 0} Years</p>
                </div>
              </div>
            </div>
          )}
          <div className="modal-action">
            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-neutral">Close</button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)}><button>close</button></div>
      </div>
    </div>
  );
}