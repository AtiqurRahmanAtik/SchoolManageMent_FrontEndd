import React, { useEffect, useState, useMemo } from 'react';
import useSection from '../../Hook/useSection'; 
import useExamination from '../../Hook/useExamination';
import useGrade from '../../Hook/useGrade'; 
import useStudentMarks from '../../Hook/useStudentMarks'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components Library
import Mtitle from '../../components library/Mtitle'; 
import TableControls from '../../components/TableControls'; 
import Pagination from '../../components/Pagination'; 
import SkeletonLoader from '../../components/SkeletonLoader'; 
import MtableLoading from '../../components library/MtableLoading'; 

export default function Results() {
  // --- Hooks ---
  const { 
    marks, 
    markDetails,
    pagination, 
    loading: marksLoading, 
    fetchMarksByBranch, 
    fetchMarkById,
    updateMark, 
    removeMark 
  } = useStudentMarks();

  const { fetchExaminationsByBranch } = useExamination();
  const { sections, getSections } = useSection();
  const { grades, fetchGradesByBranch } = useGrade();

  // --- Local States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  
  const [appliedFilterClass, setAppliedFilterClass] = useState("");
  const [appliedFilterSection, setAppliedFilterSection] = useState("");

  // Modals & Selected Data
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResultEntry, setSelectedResultEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({ mark: "", grade: "" });

  const tableHeaders = [
    { id: "student", label: "Student Details", className: "py-4 rounded-tl-box" },
    { id: "actions", label: "Actions", className: "py-4 text-right rounded-tr-box pr-12" }
  ];

  // Initial Data Fetching
  useEffect(() => {
    getSections(1, 1000); 
    fetchExaminationsByBranch(undefined, 1, 1000); 
    fetchGradesByBranch(undefined, 1, 1000); 
  }, [getSections, fetchExaminationsByBranch, fetchGradesByBranch]);

  useEffect(() => {
    fetchMarksByBranch(undefined, currentPage, limit);
  }, [fetchMarksByBranch, currentPage, limit]);

  useEffect(() => {
    const handler = setTimeout(() => { 
      setDebouncedSearch(searchTerm); 
      if (searchTerm) setCurrentPage(1); 
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- Handlers ---
  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleLimitChange = (e) => { 
    setLimit(parseInt(e.target.value, 10)); 
    setCurrentPage(1); 
  };
  
  const handleFilterSearch = () => {
    setAppliedFilterClass(filterClass);
    setAppliedFilterSection(filterSection);
    setCurrentPage(1);
  };

  const handleView = async (student) => {
    await fetchMarkById(student._id);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student, resultEntry) => {
    setSelectedStudent(student);
    setSelectedResultEntry(resultEntry);
    setEditFormData({ mark: resultEntry.mark, grade: resultEntry.grade });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (studentId, resultId) => {
    if (window.confirm("Are you sure you want to delete this specific subject mark?")) {
      try {
        await removeMark(studentId, resultId);
        toast.success("Subject mark removed successfully");
        if(isViewModalOpen) fetchMarkById(studentId); 
      } catch (err) {
        toast.error("Failed to delete mark");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const numericMark = Number(editFormData.mark);

    // 1. Basic Validation
    if (editFormData.mark === "" || isNaN(numericMark)) {
        toast.error("Please enter a valid numeric mark.");
        return;
    }

    if (!editFormData.grade) {
        toast.error("Please select a grade.");
        return;
    }

    // 2. Grade Range Validation logic (matches AddMark logic)
    const selectedGradeObj = grades.find(g => g.gradeName === editFormData.grade);
    
    if (selectedGradeObj) {
        const min = Number(selectedGradeObj.markFrom || selectedGradeObj.minMark);
        const max = Number(selectedGradeObj.markUpto || selectedGradeObj.maxMark);

        if (numericMark < min || numericMark > max) {
            toast.error(`For grade ${editFormData.grade}, marks must be between ${min} and ${max}`);
            return;
        }
    } else {
        toast.error("Selected grade configuration not found.");
        return;
    }

    try {
      await updateMark(selectedStudent._id, {
        resultId: selectedResultEntry._id,
        mark: numericMark,
        grade: editFormData.grade
      });
      toast.success(`Marks updated successfully for ${selectedStudent.studentName}`);
      setIsEditModalOpen(false);
      if(isViewModalOpen) fetchMarkById(selectedStudent._id);
    } catch (err) {
      toast.error(err.message || "Failed to update marks");
    }
  };

  // --- Filtering Logic ---
  const filteredResults = useMemo(() => {
    return marks?.filter((item) => {
      if (appliedFilterClass && item.studentClass !== appliedFilterClass) return false;
      if (appliedFilterSection && item.section !== appliedFilterSection) return false;
      if (debouncedSearch && !item.studentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) && 
          !item.registrationNo?.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [marks, appliedFilterClass, appliedFilterSection, debouncedSearch]);

  const uniqueClasses = [...new Set(sections?.map(s => s.className))];
  const filterAvailableSections = [...new Set(sections?.filter(s => !filterClass || s.className === filterClass).map(s => s.sectionName))];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Mtitle 
        title="Student Results" 
        rightcontent={
          <button className="btn btn-primary shadow-sm" onClick={() => window.print()}>
            Print List
          </button>
        }
      />

      {/* Filter Section */}
      <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 mb-6 space-y-4">
        <TableControls 
          itemsPerPage={limit} onItemsPerPageChange={handleLimitChange} 
          searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} 
        />

        <div className="flex flex-wrap items-end gap-4 border-t border-base-200 pt-4">
          <div className="form-control w-full sm:max-w-xs">
            <label className="label"><span className="label-text font-semibold">Class</span></label>
            <select className="select select-bordered w-full" value={filterClass} onChange={(e) => {setFilterClass(e.target.value); setFilterSection("");}}>
              <option value="">All Classes</option>
              {uniqueClasses.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="form-control w-full sm:max-w-xs">
            <label className="label"><span className="label-text font-semibold">Section</span></label>
            <select className="select select-bordered w-full" value={filterSection} onChange={(e) => setFilterSection(e.target.value)} disabled={!filterClass}>
              <option value="">All Sections</option>
              {filterAvailableSections.map((sec, idx) => <option key={idx} value={sec}>{sec}</option>)}
            </select>
          </div>

          <button onClick={handleFilterSearch} className="btn btn-primary bg-[#82CD00] border-none text-white hover:bg-[#6fb000]">Search Students</button>
          
          {(appliedFilterClass || appliedFilterSection) && (
            <button onClick={() => {
              setFilterClass(""); setFilterSection(""); 
              setAppliedFilterClass(""); setAppliedFilterSection("");
              setCurrentPage(1);
            }} className="btn btn-ghost text-error">Clear</button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content">
              <tr>
                {tableHeaders.map((header) => <th key={header.id} className={header.className}>{header.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {marksLoading ? (
                <SkeletonLoader />
              ) : filteredResults?.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center">
                     <MtableLoading data={filteredResults} />
                     <p className="text-base-content/50 mt-2">No marks found</p>
                  </td>
                </tr>
              ) : (
                filteredResults?.map((student) => (
                  <tr key={student._id} className="hover">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12 bg-base-200">
                            <img src={student.studentImage} alt="student" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-md">{student.studentName}</div>
                          <div className="text-xs opacity-60">Reg: {student.registrationNo}</div>
                          <div className="text-xs font-semibold text-primary">
                            {student.studentClass} ({student.section})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-12">
                      <button onClick={() => handleView(student)} className="btn btn-outline btn-success btn-sm normal-case">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!marksLoading && pagination?.totalPages > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination 
            currentPage={currentPage} totalPages={pagination.totalPages} 
            totalItems={pagination.totalItems} onPageChange={handlePageChange} 
          />
        </div>
      )}

      {/* --- MARK DETAILS MODAL --- */}
      {isViewModalOpen && markDetails && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-3xl bg-[#F8F9FA] p-0 overflow-hidden">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-xl text-[#C26F12]">Mark Details</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>

            <div className="p-6">
              <div className="bg-gray-200/50 p-5 rounded-xl flex items-center gap-5 mb-6 border border-gray-200">
                <img src={markDetails.studentImage} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm" alt="Student" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800">{markDetails.studentName}</h4>
                  <p className="text-sm text-slate-500">Reg No: {markDetails.registrationNo}</p>
                  <p className="text-sm text-slate-600">
                    Class: <span className="font-medium">{markDetails.studentClass}</span> | 
                    Section: <span className="font-medium">{markDetails.section}</span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                      <th>Exam</th>
                      <th>Subject</th>
                      <th className="text-center">Mark</th>
                      <th className="text-center">Grade</th>
                      <th className="text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markDetails.results?.map((res) => (
                      <tr key={res._id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="text-xs font-bold text-orange-600 uppercase">{res.examType}</td>
                        <td className="text-sm font-medium">{res.subjectName}</td>
                        <td className="text-sm text-center font-bold">{res.mark}</td>
                        <td className="text-center">
                          <span className="badge badge-success badge-outline font-bold text-xs">{res.grade}</span>
                        </td>
                        <td className="text-right pr-4 space-x-1">
                           <button onClick={() => handleEdit(markDetails, res)} className="btn btn-ghost btn-xs text-info">Edit</button>
                           <button onClick={() => handleDelete(markDetails._id, res._id)} className="btn btn-ghost btn-xs text-error">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MARK MODAL --- */}
      {isEditModalOpen && (
        <div className="modal modal-open backdrop-blur">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4 text-primary">Edit Subject Mark</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Mark</span></label>
                <input 
                  type="number" 
                  className="input input-bordered w-full" 
                  value={editFormData.mark} 
                  onChange={(e) => setEditFormData({...editFormData, mark: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Grade</span></label>
                <select 
                  className="select select-bordered w-full" 
                  value={editFormData.grade} 
                  onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}
                >
                  <option value="">Select Grade</option>
                  {grades?.map((g) => (
                    <option key={g._id} value={g.gradeName}>{g.gradeName}</option>
                  ))}
                </select>
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}