import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSubject from "../../Hook/useSubject"; 
import useTeachers from "../../Hook/useTeachers"; 
import useClassRoutines from "../../Hook/useClassRoutines"; 
import { useClassTimes } from "../../Hook/useClassTimes"; 
import { useDays } from "../../Hook/useDays"; 

export default function Routine() {
  // Fetch subjects and classes using the provided hook
  const { subjects, fetchSubjectsByBranch, loading: subjectLoading } = useSubject();
  
  // Fetch teachers using the provided hook
  const { teachers, fetchTeachers, loading: teacherLoading } = useTeachers();

  // Fetch class routines using the hook
  const { 
    classRoutines, 
    fetchClassRoutinesByBranch, 
    createClassRoutine, 
    updateClassRoutine,
    loading: routineLoading
  } = useClassRoutines();

  // Fetch class times dynamically
  const {
    classTimes,
    fetchClassTimesByBranch,
    loading: classTimeLoading
  } = useClassTimes();

  // Fetch days dynamically
  const {
    days: fetchedDays,
    fetchDaysByBranch,
    loading: daysLoading
  } = useDays();

  // Sort days in correct week order (assuming standard week starting Saturday)
  const dayOrder = {
    "SATURDAY": 1,
    "SUNDAY": 2,
    "MONDAY": 3,
    "TUESDAY": 4,
    "WEDNESDAY": 5,
    "THURSDAY": 6,
    "FRIDAY": 7
  };

  // Dynamic Days from the Days API, sorted correctly
  const days = fetchedDays
    ?.map((d) => d.dayName.toUpperCase())
    .sort((a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99)) || [];

  // --- SORTING LOGIC FOR TIME ASCENDING ORDER ---
  const parseTimeForSort = (timeStr) => {
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
    
    // Fallback heuristic for standard school hours (8 AM to 5 PM) if no am/pm is provided
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
          // Automatic heuristic assignment (8-11 is AM, 12-7 is PM)
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

      // Ensure minutes are properly formatted
      const displayMin = min.length === 1 ? `0${min}` : min;

      return `${displayHour}:${displayMin} ${ampm}`;
    };

    const parts = timeStr.split(/\s*-\s*|\s+to\s+/i);
    if (parts.length === 2) {
      return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
    }
    
    return timeStr;
  };

  // Dynamic Times Sorted in Ascending Order
  const times = classTimes
    ?.map((ct) => ct.classTime)
    .sort((a, b) => parseTimeForSort(a) - parseTimeForSort(b)) || [];

  // --- BREAK TIME LOGIC ---
  const isBreakTime = (timeStr) => {
    const formattedTime = formatTimeDisplay(timeStr);
    // Checks the strictly formatted string to perfectly catch the break time
    return formattedTime === "1:00 PM - 2:00 PM";
  };

  // State to hold the routine data. 
  // Key format: "CLASSNAME-DAY-TIME"
  const [routineData, setRoutineData] = useState({});

  // Filter state for the top dropdown - default to "Play" instead of ""
  const [selectedClass, setSelectedClass] = useState("Play");

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: "",
    day: "",
    time: "",
    teacherId: "", 
    teacherName: "",
    subjectName: "",
    subjectCode: "",
  });

  // Fetch all subjects, teachers, routines, class times, and days on mount
  useEffect(() => {
    fetchSubjectsByBranch(undefined, "", 1, 100); 
    fetchTeachers(1, 100); 
    fetchClassRoutinesByBranch(undefined, 1, 1000); 
    fetchClassTimesByBranch(undefined, 1, 100); 
    fetchDaysByBranch(undefined, 1, 100); 
  }, [fetchSubjectsByBranch, fetchTeachers, fetchClassRoutinesByBranch, fetchClassTimesByBranch, fetchDaysByBranch]);

  // Set "Play" as default selected class once unique classes are loaded if "Play" exists, otherwise first available
  const uniqueClasses = Array.from(
    new Set(subjects?.map((sub) => sub.ClassName).filter(Boolean))
  );

  useEffect(() => {
     if(uniqueClasses.length > 0 && selectedClass === "") {
        if(uniqueClasses.includes("Play")) {
           setSelectedClass("Play");
        } else {
           setSelectedClass(uniqueClasses[0]);
        }
     }
  }, [uniqueClasses, selectedClass]);

  // Map fetched routines from DB into the local routineData dictionary format
  useEffect(() => {
    if (classRoutines && classRoutines.length > 0) {
      const mappedData = {};
      classRoutines.forEach((routine) => {
        const key = `${routine.className}-${routine.day}-${routine.time}`;
        mappedData[key] = {
          _id: routine._id,
          teacherId: routine.teacherId,
          teacherName: routine.teacherName,
          subjectName: routine.subjectName,
          subjectCode: routine.subjectCode,
        };
      });
      setRoutineData(mappedData);
    } else {
      setRoutineData({});
    }
  }, [classRoutines]);

  // Derived state: Subjects specific to the selected class in the modal
  const classSubjects = subjects?.filter(sub => sub.ClassName === formData.className) || [];
  
  // Derived state: Subject Codes specific to the selected subject in the modal
  const availableSubjectCodes = Array.from(
    new Set(classSubjects
      .filter(sub => sub.SubjectName === formData.subjectName)
      .map(sub => sub.SubjectCode)
      .filter(Boolean)
    )
  );

  // Handlers
  const openModal = () => {
    setFormData((prev) => ({ 
      ...prev, 
      className: selectedClass || (uniqueClasses[0] || ""),
      time: times.length > 0 ? times[0] : "", 
      day: days.length > 0 ? days[0] : "" 
    }));
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fill Subject Code when a Subject Name is selected
  const handleSubjectChange = (e) => {
    const selectedSubName = e.target.value;
    const matchedSubjects = classSubjects.filter(sub => sub.SubjectName === selectedSubName);
    
    setFormData((prev) => ({
      ...prev,
      subjectName: selectedSubName,
      subjectCode: matchedSubjects.length > 0 ? matchedSubjects[0].SubjectCode : "",
    }));
  };

  // Find matching teacher ID when a teacher is selected
  const handleTeacherChange = (e) => {
    const selectedTeacherName = e.target.value;
    const matchedTeacher = teachers?.find((t) => t.teacherName === selectedTeacherName);
    
    setFormData((prev) => ({
      ...prev,
      teacherName: selectedTeacherName,
      teacherId: matchedTeacher ? matchedTeacher._id : "", 
    }));
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!formData.className) {
      toast.warning("Please select a class first.");
      return;
    }
    
    if (!formData.teacherId) {
      toast.warning("Please select a valid teacher.");
      return;
    }

    const key = `${formData.className}-${formData.day}-${formData.time}`;
    const existingRoutine = routineData[key];

    const payload = {
      className: formData.className,
      day: formData.day,
      time: formData.time,
      teacherId: formData.teacherId, 
      teacherName: formData.teacherName,
      subjectName: formData.subjectName,
      subjectCode: formData.subjectCode,
    };

    try {
      if (existingRoutine && existingRoutine._id) {
        await updateClassRoutine(existingRoutine._id, payload);
      } else {
        await createClassRoutine(payload);
      }

      await fetchClassRoutinesByBranch(undefined, 1, 1000);
      
      closeModal();
      setFormData({ ...formData, teacherId: "", teacherName: "", subjectName: "", subjectCode: "" });
      toast.success("Class routine saved successfully!");
    } catch (error) {
      console.error("Failed to save routine:", error);
      toast.error(error.message || "Failed to save class routine.");
    }
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen bg-[#f4f6f9] font-sans">
      
      {/* ToastContainer for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Page Header and Controls */}
      <div className="max-w-[1400px] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#e9ecef] pb-6">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#2c3e50] tracking-tight">
            Class Routine Management
          </h1>
          <p className="text-[14px] text-[#6c757d] mt-1">
            Manage and organize daily schedules for classes
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main Select Class Dropdown */}
          <select
            className="select select-bordered bg-white border-[#cccccc] text-[#333333] w-full sm:w-64 rounded-md h-[40px] min-h-[40px] shadow-sm focus:outline-none focus:border-[#78c818]"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={subjectLoading || routineLoading}
          >
            <option value="" disabled>
              {subjectLoading || routineLoading ? "Loading..." : "Select Class..."}
            </option>
            {uniqueClasses.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <button 
            onClick={openModal} 
            className="btn bg-[#78c818] hover:bg-[#6ab314] text-white border-none shadow-sm rounded-md px-6 h-[40px] min-h-[40px] flex items-center transition-colors whitespace-nowrap" 
            disabled={!selectedClass || routineLoading || classTimeLoading || daysLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="font-semibold text-[14px]">Edit</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Card */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-[#e9ecef] p-4 md:p-6 overflow-x-auto">
        
        {!selectedClass ? (
          <div className="py-24 text-center flex flex-col items-center justify-center text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-bold text-gray-500">No Class Selected</p>
            <p className="text-sm mt-2">Please select a class from the dropdown above to view or edit its routine.</p>
          </div>
        ) : days.length === 0 || times.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-xl font-bold text-gray-500">Incomplete Setup</p>
            <p className="text-sm mt-2">Please ensure you have configured both Days and Class Times in settings.</p>
          </div>
        ) : (
          <div className="min-w-[1000px] lg:min-w-full">
            {/* CSS Grid. Columns based on times array length + 1 for Days col */}
            <div className={`grid gap-[10px]`} style={{ gridTemplateColumns: `repeat(${times.length + 1}, minmax(0, 1fr))` }}>
              
              {/* --- TABLE HEADERS ROW --- */}
              {/* Top Left Corner Empty Cell */}
              <div className="bg-[#e9ecef] border border-[#dee2e6] rounded-md text-[#212529] font-bold py-[18px] flex items-center justify-center text-[13px] tracking-wide uppercase">
                DAY / TIME
              </div>
              
              {/* Time Headers - USING FORMATTER HERE */}
              {times.map((time) => (
                <div
                  key={time}
                  className="bg-[#e9ecef] border border-[#dee2e6] rounded-md text-[#212529] font-bold py-[18px] flex items-center justify-center text-[13px] tracking-wide"
                >
                  {formatTimeDisplay(time)}
                </div>
              ))}

              {/* --- TABLE BODY ROWS (Grouped by Day) --- */}
              {days.map((day) => (
                <React.Fragment key={day}>
                  
                  {/* Day Column (Leftmost) */}
                  <div className={`border rounded-md flex items-center justify-center py-[18px] font-bold text-[13px] uppercase tracking-wide ${
                      day === "FRIDAY" 
                        ? "bg-[#fceae9] border-[#f5caca] text-[#d64541]" 
                        : "bg-[#e9ecef] border-[#dee2e6] text-[#343a40]"
                    }`}>
                    {day}
                  </div>
                  
                  {/* Time Cells for this specific day */}
                  {times.map((time) => {
                     // 1. Break Time Logic Column
                     if(isBreakTime(time)){
                        return (
                          <div
                            key={`${day}-${time}`}
                            className="bg-[#f8f9fa] border border-[#e9ecef] rounded-md min-h-[105px] flex items-center justify-center"
                          >
                            <span className="text-[#adb5bd] font-bold uppercase tracking-[0.2em] text-sm">Break</span>
                          </div>
                        )
                     }

                     // 2. Friday Off Day Logic Row
                     if (day === "FRIDAY") {
                        return (
                          <div
                            key={`${day}-${time}`}
                            className="bg-[#fffcfc] border border-[#fceae9] rounded-md min-h-[105px] flex flex-col items-center justify-center"
                          >
                            <span className="text-[#f3b5b4] font-bold uppercase tracking-wider text-[14px]">OFF</span>
                          </div>
                        );
                      }

                      // 3. Standard Class Logic Cell
                      const key = `${selectedClass}-${day}-${time}`;
                      const cellData = routineData[key];
                      
                      return (
                        <div
                          key={key}
                          className="bg-white border border-[#dee2e6] rounded-md min-h-[105px] p-2 flex flex-col items-center justify-center transition-shadow hover:shadow-md"
                        >
                          {cellData ? (
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[#d97c27] font-bold text-[15px] mb-0.5">
                                {cellData.subjectName}
                              </span>
                              <span className="text-[#6c757d] text-[12px] mb-0.5">
                                {cellData.subjectCode}
                              </span>
                              <span className="text-[#adb5bd] text-[12px] italic">
                                {cellData.teacherName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#ced4da] font-bold text-lg">-</span>
                          )}
                        </div>
                      );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Routine Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`} style={{ zIndex: 999 }}>
        <div className="modal-box w-11/12 max-w-3xl p-6 md:p-8 bg-white rounded-lg shadow-xl overflow-hidden">
          <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500">
            ✕
          </button>
          
          <h3 className="font-bold text-xl text-[#2c3e50] mb-6 border-b border-gray-200 pb-3">
            Edit Class Routine
          </h3>

          <form onSubmit={handleSaveRoutine} className="w-full flex flex-col gap-5">
            
            {/* ROW 1: Class, Day, Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Target Class</span>
                </label>
                <input
                  type="text"
                  value={formData.className}
                  readOnly
                  className="input input-bordered w-full bg-gray-100 border-gray-300 text-gray-700"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Select Day</span>
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  disabled={daysLoading}
                  className="select select-bordered w-full border-gray-300 focus:border-[#78c818] focus:outline-none"
                >
                  <option value="" disabled>Select Day</option>
                  {days.map(day => (
                    <option key={day} value={day} disabled={day === "FRIDAY"}>
                      {day === "FRIDAY" ? `${day} (Off Day)` : day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Class Time</span>
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  disabled={classTimeLoading}
                  className="select select-bordered w-full border-gray-300 focus:border-[#78c818] focus:outline-none"
                >
                  <option value="" disabled>Select Time</option>
                  {times.map(time => (
                    <option key={time} value={time} disabled={isBreakTime(time)}>
                      {/* USING FORMATTER HERE FOR DROPDOWN */}
                      {isBreakTime(time) ? `${formatTimeDisplay(time)} (Break)` : formatTimeDisplay(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 2: Subject Name, Subject Code, Teacher Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Subject Name</span>
                </label>
                <select
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleSubjectChange}
                  required
                  className="select select-bordered w-full border-gray-300 focus:border-[#78c818] focus:outline-none"
                >
                  <option value="" disabled>Select Subject</option>
                  {Array.from(new Set(classSubjects.map(sub => sub.SubjectName))).map((subName, index) => (
                    <option key={index} value={subName}>
                      {subName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Subject Code</span>
                </label>
                <select
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.subjectName || availableSubjectCodes.length === 0}
                  className="select select-bordered w-full border-gray-300 focus:border-[#78c818] focus:outline-none"
                >
                  <option value="" disabled>Select Code</option>
                  {availableSubjectCodes.map((code, index) => (
                    <option key={index} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-gray-600 text-xs uppercase tracking-wide">Teacher Name</span>
                </label>
                <select
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleTeacherChange}
                  required
                  disabled={teacherLoading}
                  className="select select-bordered w-full border-gray-300 focus:border-[#78c818] focus:outline-none"
                >
                  <option value="" disabled>Assign Teacher</option>
                  {teachers?.map((teacher, index) => (
                    <option key={teacher._id || index} value={teacher.teacherName}>
                      {teacher.teacherName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-action mt-4 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={closeModal} className="btn btn-ghost border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={routineLoading}>
                Cancel
              </button>
              <button type="submit" className="btn bg-[#78c818] hover:bg-[#6ab314] text-white border-none min-w-[140px]" disabled={routineLoading}>
                {routineLoading ? (
                  <span className="loading loading-spinner loading-sm text-white"></span>
                ) : (
                  "Save Routine"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Backdrop click to close */}
        <div className="modal-backdrop bg-black/40" onClick={!routineLoading ? closeModal : undefined}>
          <button type="button" className="cursor-default">close</button>
        </div>
        
      </div>
    </div>
  );
}