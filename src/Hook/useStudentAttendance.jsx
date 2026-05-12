import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Ensure you import your useAuth hook

const API = "/student-attendance";

export const useStudentAttendance = () => {
  const axiosPublic = useAxiosPublic();

  const [studentAttendances, setStudentAttendances] = useState([]);
  const [studentAttendanceDetails, setStudentAttendanceDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch, token } = useAuth(); 

  // Helper function to build query parameters
  const buildQueryParams = (page, limit, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    
    if (filters.search) params.append("search", filters.search);
    if (filters.date) params.append("date", filters.date);
    if (filters.studentClass) params.append("studentClass", filters.studentClass);
    if (filters.section) params.append("section", filters.section);
    
    return params.toString();
  };

  // GET: All Student Attendances
  const fetchAllStudentAttendances = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams(page, limit, filters);
      const response = await axiosPublic.get(`${API}/?${queryString}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setStudentAttendances(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  // GET: All Student Attendances by Branch
  const fetchStudentAttendancesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams(page, limit, filters);
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryString}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setStudentAttendances(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch, token]);

  // GET: Single
  const fetchStudentAttendanceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setStudentAttendanceDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // POST: Create
  const createStudentAttendance = useCallback(async (studentAttendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...studentAttendanceData, branch: studentAttendanceData.branch || branch };
      const response = await axiosPublic.post(`${API}/post`, payload);
      
      const result = response.data;
      // Axios throws on error automatically
      return result;
    } catch (err) {
      setError(err.message);
      throw err; 
    } finally {
      setLoading(false);
    }
  }, [branch, token]);

  // PUT: Update
  const updateStudentAttendance = useCallback(async (id, studentAttendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, studentAttendanceData);
      
      const result = response.data;
      // Axios throws on error automatically
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // DELETE: Remove
  const removeStudentAttendance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.delete(`${API}/delete/${id}`);
      
      const result = response.data;
      // Axios throws on error automatically
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    studentAttendances,
    studentAttendanceDetails,
    pagination,
    loading,
    error,
    fetchAllStudentAttendances,
    fetchStudentAttendancesByBranch,
    fetchStudentAttendanceById,
    createStudentAttendance,
    updateStudentAttendance,
    removeStudentAttendance,
  };
};

export default useStudentAttendance;