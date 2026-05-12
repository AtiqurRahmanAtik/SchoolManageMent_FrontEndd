import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Ensure you import your useAuth hook

const API = "/employee-attendance";

export const useEmployeeAttendance = () => {
  const axiosPublic = useAxiosPublic();

  const [employeeAttendances, setEmployeeAttendances] = useState([]);
  const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Added token here to securely call your authenticated backend routes
  const { branch, token } = useAuth(); 

  // Helper function to build query parameters
  const buildQueryParams = (page, limit, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.date) params.append("date", filters.date);
    if (filters.employeeRole) params.append("employeeRole", filters.employeeRole);
    if (filters.employeeMobileNo) params.append("employeeMobileNo", filters.employeeMobileNo);
    if (filters.search) params.append("search", filters.search);
    return params.toString();
  };

  // GET: All Employee Attendances (Paginated & Searchable via Filters)
  const fetchAllEmployeeAttendances = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams(page, limit, filters);
      const response = await axiosPublic.get(`${API}/?${queryString}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployeeAttendances(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  
  // GET: All Employee Attendances by Branch (Paginated & Searchable via Filters)
  const fetchEmployeeAttendancesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams(page, limit, filters);
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryString}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployeeAttendances(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch, token]);

  // GET: Single Employee Attendance Details By ID
  const fetchEmployeeAttendanceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployeeAttendanceDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // POST: Create OR Update (Upsert) a new Employee Attendance
  const createEmployeeAttendance = useCallback(async (employeeAttendanceData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure the payload has the required fields for the backend Upsert to work:
      // specifically 'employeeId' and 'date'.
      const payload = { ...employeeAttendanceData, branch: employeeAttendanceData.branch || branch };
      
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

  // PUT: Update an Employee Attendance (Targeted update by MongoDB _id)
  const updateEmployeeAttendance = useCallback(async (id, employeeAttendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, employeeAttendanceData);
      
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

  // DELETE: Remove an Employee Attendance
  const removeEmployeeAttendance = useCallback(async (id) => {
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
    employeeAttendances,
    employeeAttendanceDetails,
    pagination,
    loading,
    error,
    fetchAllEmployeeAttendances,
    fetchEmployeeAttendancesByBranch,
    fetchEmployeeAttendanceById,
    createEmployeeAttendance,
    updateEmployeeAttendance,
    removeEmployeeAttendance,
  };
};

export default useEmployeeAttendance;