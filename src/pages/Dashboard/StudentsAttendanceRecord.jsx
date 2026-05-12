import React, { useEffect, useState } from 'react';
import useStudentAttendance from '../../Hook/useStudentAttendance'; // Adjust path if needed
import useSection from '../../Hook/useSection'; // Imported to keep the exact filter structure
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Import your reusable components (Adjust the paths according to your project structure)
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function StudentsAttendanceRecord() {
  const {
    studentAttendances,
    pagination,
    loading,
    error,
    fetchStudentAttendancesByBranch
  } = useStudentAttendance();

  const { sections, getSections } = useSection();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDate, setFilterDate] = useState(""); 
  
  const [appliedFilterClass, setAppliedFilterClass] = useState("");
  const [appliedFilterSection, setAppliedFilterSection] = useState("");
  const [appliedFilterDate, setAppliedFilterDate] = useState(""); 

  const tableHeaders = [
    { id: "student", label: "Student Profile", className: "py-4 rounded-tl-box" },
    { id: "date", label: "Date", className: "py-4 hidden sm:table-cell" },
    { id: "classInfo", label: "Class & Section", className: "py-4 hidden md:table-cell" },
    { id: "status", label: "Status", className: "py-4 rounded-tr-box pr-8 text-right" }
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

  useEffect(() => {
    const filters = {};
    if (appliedFilterClass) filters.studentClass = appliedFilterClass;
    if (appliedFilterSection) filters.section = appliedFilterSection;
    if (appliedFilterDate) filters.date = appliedFilterDate; 
    if (debouncedSearch) filters.search = debouncedSearch; 

    fetchStudentAttendancesByBranch(undefined, currentPage, limit, filters);
  }, [fetchStudentAttendancesByBranch, currentPage, limit, debouncedSearch, appliedFilterClass, appliedFilterSection, appliedFilterDate]);

  const uniqueClasses = Array.from(new Set(sections?.map((s) => s.className).filter(Boolean)));
  
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

  const handleFilterSearch = () => {
    setAppliedFilterClass(filterClass);
    setAppliedFilterSection(filterSection);
    setAppliedFilterDate(filterDate); 
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStatusBadge = (record) => {
    if (!record) return <div className="badge badge-ghost font-medium px-4 py-3">Unknown</div>;

    const statusValue = record.attendanceStatus || record.status;

    if (typeof statusValue === 'string') {
      const statusFormatted = statusValue.toLowerCase();
      if (statusFormatted === 'present') {
        return <div className="badge badge-success text-white font-medium px-4 py-3">Present</div>;
      }
      if (statusFormatted === 'absent') {
        return <div className="badge badge-error text-white font-medium px-4 py-3">Absent</div>;
      }
      if (statusFormatted === 'late') {
        return <div className="badge badge-warning text-white font-medium px-4 py-3">Late</div>;
      }
      return <div className="badge badge-ghost font-medium px-4 py-3 capitalize">{statusValue}</div>;
    }

    if (record.present === true) {
      return <div className="badge badge-success text-white font-medium px-4 py-3">Present</div>;
    }
    if (record.absent === true) {
      return <div className="badge badge-error text-white font-medium px-4 py-3">Absent</div>;
    }

    if (typeof statusValue === 'boolean') {
      return (
        <div className={`badge ${statusValue ? 'badge-success' : 'badge-error'} text-white font-medium px-4 py-3`}>
          {statusValue ? 'Present' : 'Absent'}
        </div>
      );
    }

    return <div className="badge badge-ghost font-medium px-4 py-3 capitalize">Not Marked</div>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Mtitle 
        title="Student Attendance Records" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            Manage and view daily student attendance history.
          </span>
        }
        rightcontent={
          <Link to={"/attendance/student"}>
            <button className="btn btn-primary shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Take Attendance
            </button>
          </Link>
        }
      />

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
              if (appliedFilterClass) filters.studentClass = appliedFilterClass;
              if (appliedFilterSection) filters.section = appliedFilterSection;
              if (appliedFilterDate) filters.date = appliedFilterDate;
              if (debouncedSearch) filters.search = debouncedSearch;
              fetchStudentAttendancesByBranch(undefined, currentPage, limit, filters);
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

          {(appliedFilterClass || appliedFilterSection || appliedFilterDate) && (
            <button 
              onClick={() => {
                setFilterClass("");
                setFilterSection("");
                setFilterDate("");
                setAppliedFilterClass("");
                setAppliedFilterSection("");
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
              ) : studentAttendances?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={studentAttendances} />
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
                studentAttendances?.map((record) => {
                  const studentName = record.studentName || record.student?.studentName || "Unknown Student";
                  const studentPhoto = record.studentPhoto || record.student?.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`;
                  const studentClass = record.studentClass || record.student?.studentClass || "N/A";
                  const section = record.section || record.student?.section || "N/A";
                  const regNo = record.registrationNo || record.student?.registrationNo || "N/A";

                  return (
                    <tr key={record._id} className="hover">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10 bg-base-200">
                              <img 
                                src={studentPhoto} 
                                alt={studentName} 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-base">{studentName}</div>
                            <div className="text-xs text-base-content/60">Reg No: {regNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 hidden sm:table-cell">
                        <div className="text-sm font-medium">
                          {formatDate(record.date)}
                        </div>
                      </td>
                      <td className="py-4 hidden md:table-cell">
                        <div className="text-sm font-medium">{studentClass}</div>
                        <div className="text-xs text-base-content/60">Sec: {section}</div>
                      </td>
                      <td className="py-4 pr-8 text-right">
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