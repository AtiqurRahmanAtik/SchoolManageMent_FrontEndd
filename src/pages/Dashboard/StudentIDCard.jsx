import React, { useEffect, useState } from 'react';
import useStudents from '../../Hook/useStudents'; 
import useSection from '../../Hook/useSection'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Import your reusable components
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function StudentIDCard() {
  // --- Student Hook ---
  const {
    students,
    pagination,
    loading,
    error,
    fetchStudentsByBranch,
    fetchStudentById,
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
  const [appliedFilterClass, setAppliedFilterClass] = useState("");
  const [appliedFilterSection, setAppliedFilterSection] = useState("");

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // --- Dynamic Table Headers ---
  const tableHeaders = [
    { id: "student", label: "Student Profile", className: "py-4 rounded-tl-box" },
    { id: "registration", label: "Registration No", className: "py-4 hidden sm:table-cell" },
    { id: "classInfo", label: "Class & Section", className: "py-4 hidden md:table-cell" },
    { id: "contact", label: "Contact Info", className: "py-4 hidden lg:table-cell" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-8" }
  ];

  // Fetch sections for the dropdowns on component mount
  useEffect(() => {
    getSections(1, 1000); 
  }, [getSections]);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setCurrentPage(1); 
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch students
  useEffect(() => {
    fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch);
  }, [fetchStudentsByBranch, currentPage, limit, debouncedSearch]);

  // --- Dropdown Logic Extraction ---
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
    setCurrentPage(1);
  };

  // Handle View Button Click
  const handleViewClick = async (id) => {
    try {
      const fetchedStudent = await fetchStudentById(id);
      const data = fetchedStudent?.data || fetchedStudent;
      if (data) {
        setViewData(data);
        setIsViewModalOpen(true);
      } else {
        toast.error("Could not load student data for viewing.");
      }
    } catch (err) {
      toast.error("Failed to fetch student details.");
    }
  };

  // --- Applying Client-Side Filters ---
  const filteredStudents = students?.filter((student) => {
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
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ✅ 🔥 FIXED PRINT CSS */}
      <style>
        {`
          @media print {
            @page {
              margin: 0; /* Remove default browser page margins */
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important; /* Force colors */
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            #printable-id-card,
            #printable-id-card * {
              visibility: visible !important;
            }
            #printable-id-card {
              position: fixed !important; /* Lock to viewport */
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: auto !important;
              
              display: flex !important;
              flex-direction: row !important; /* 🔥 FORCE SIDE BY SIDE */
              justify-content: center !important;
              align-items: flex-start !important; /* Push to the very top */
              gap: 40px !important;
              
              padding-top: 40px !important; /* Small breathing room from top edge */
              background: white !important;
              margin: 0 !important;
            }
            /* 🔥 VERY IMPORTANT: prevent breaking */
            #printable-id-card > div {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            /* 🔥 Remove modal restrictions */
            .modal-box {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              overflow: visible !important;
              max-width: none !important;
              width: 100% !important;
              background: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              transform: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      {/* Header Section */}
      <Mtitle 
        title="Student ID Cards" 
        middlecontent={
          <span className="text-sm text-base-content/70 hidden md:inline-block">
            View and print ID cards for enrolled students.
          </span>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex flex-col">
            <span className="font-semibold">Error Loading Students</span>
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => fetchStudentsByBranch(undefined, currentPage, limit, debouncedSearch)}
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

        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
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

          {(appliedFilterClass || appliedFilterSection) && (
            <button 
              onClick={() => {
                setFilterClass("");
                setFilterSection("");
                setAppliedFilterClass("");
                setAppliedFilterSection("");
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
              ) : filteredStudents?.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
                    <MtableLoading data={filteredStudents} />
                    <div className="flex flex-col items-center justify-center text-base-content/50 mt-[-40px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents?.map((student) => (
                  <tr key={student._id} className="hover">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-200">
                            <img 
                              src={student.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=random`} 
                              alt={student.studentName} 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base">{student.studentName}</div>
                          <div className="text-xs text-base-content/60">{student.gender || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 hidden sm:table-cell">
                      <div className="badge badge-ghost font-medium">
                        {student.registrationNo || 'N/A'}
                      </div>
                    </td>

                    <td className="py-4 hidden md:table-cell">
                      <div className="text-sm font-medium">{student.studentClass || 'N/A'}</div>
                      <div className="text-xs text-base-content/60">Sec: {student.section || 'N/A'}</div>
                    </td>

                    <td className="py-4 hidden lg:table-cell">
                      <div className="text-sm font-medium">{student.mobileNo || student.fatherMobileNo || 'No Number'}</div>
                    </td>

                    <td className="py-4 text-right pr-6">
                      <button 
                        onClick={() => handleViewClick(student._id)}
                        className="btn btn-sm btn-outline btn-primary"
                        title="View ID Card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        View ID
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* --- VIEW & PRINT STUDENT ID MODAL --- */}
      <div className={`modal ${isViewModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box max-w-4xl p-6 overflow-x-hidden bg-base-200">
          
          {viewData && (
            <div id="printable-id-card" className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              
              {/* FRONT SIDE - ✅ Added shrink-0 print:scale-100 */}
              <div className="w-[320px] h-[480px] shrink-0 print:scale-100 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col relative text-slate-800 border border-slate-200">
                {/* Header Background Design */}
                <div className="h-44 bg-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary rotate-45 translate-x-20 -translate-y-20"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/40 rotate-45 translate-x-10 -translate-y-16 opacity-50"></div>
                  
                  <div className="relative z-10 p-6 flex flex-col items-end text-white">
                    <h2 className="text-xl font-black leading-tight text-right uppercase tracking-tighter">
                      DataIT <br/> School
                    </h2>
                    <p className="text-[10px] opacity-70 tracking-[0.2em]">EXCELLENCE IN TECH</p>
                  </div>

                  {/* Photo Container */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-40 bg-slate-100 border-4 border-white shadow-lg z-20 overflow-hidden rounded-md">
                    <img 
                      src={viewData.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewData.studentName)}&background=random`} 
                      className="w-full h-full object-cover" 
                      alt="Student" 
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-24 px-8 text-center flex flex-col">
                  <h2 className="text-primary  font-black text-2xl tracking-tighter uppercase mb-6">Student ID</h2>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                      <span className="text-sm font-bold uppercase truncate">{viewData.studentName}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col border-b border-slate-100 pb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reg No</span>
                        <span className="text-sm font-bold">{viewData.registrationNo || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-100 pb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
                        <span className="text-sm font-bold">{viewData.studentClass || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col border-b border-slate-100 pb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Section</span>
                        <span className="text-sm font-bold uppercase">{viewData.section || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-100 pb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                        <span className="text-sm font-bold text-error">{viewData.bloodGroup || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact</span>
                      <span className="text-sm font-bold">{viewData.mobileNo || viewData.fatherMobileNo || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Bottom Accents */}
                  <div className="absolute bottom-0 left-0 w-full h-12 pointer-events-none overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary rotate-45 -translate-x-8 translate-y-8"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-800 rotate-45 translate-x-12 translate-y-12"></div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE - ✅ Added shrink-0 print:scale-100 */}
              <div className="w-[320px] h-[480px] shrink-0 print:scale-100 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative text-white border border-slate-700">
                <div className="p-8 flex flex-col h-full">
                  <div className="border-l-4 border-primary pl-4 mb-8">
                    <h3 className="text-lg font-bold uppercase tracking-widest">Instructions</h3>
                    <p className="text-[8px] opacity-50 uppercase tracking-widest">Academic Year 2026-31</p>
                  </div>

                  <ul className="text-[10px] space-y-4 opacity-80 list-disc pl-4 leading-relaxed">
                    <li>This card is the property of DataIT School and is non-transferable.</li>
                    <li>Loss of this card must be reported to the office immediately.</li>
                    <li>The holder must carry this card within school premises.</li>
                    <li>Fraudulent use of this card will lead to disciplinary action.</li>
                  </ul>

                  <div className="mt-auto space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className="w-16 h-px bg-white/30 mb-2"></div>
                        <p className="text-[8px] uppercase font-bold text-primary">Principal</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-px bg-white/30 mb-2"></div>
                        <p className="text-[8px] uppercase font-bold text-primary">Authorized</p>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] font-semibold text-primary">DataIT School</p>
                      <p className="text-[9px] opacity-60">Ghoshpara, Dhaka, Bangladesh</p>
                      <p className="text-[8px] opacity-40 mt-1">www.dataitbd.com</p>
                    </div>
                  </div>
                </div>
                
                {/* Back side corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rotate-45 translate-x-8 -translate-y-8"></div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-action no-print flex justify-between items-center mt-8 pt-4 border-t border-base-content/10">
            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-ghost">Close</button>
            
            {/* ✅ 🔥 FIXED PRINT TIMEOUT */}
            <button 
              onClick={() => {
                setTimeout(() => {
                  window.print();
                }, 300);
              }} 
              className="btn btn-primary px-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print ID Card
            </button>
          </div>
        </div>
        
        <div className="modal-backdrop no-print" onClick={() => setIsViewModalOpen(false)}>
          <button className="cursor-default">close</button>
        </div>
      </div>

    </div>
  );
}