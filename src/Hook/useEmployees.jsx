import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Ensure you import your useAuth hook

const API = "/employee";



export const useEmployees = () => {
  const axiosPublic = useAxiosPublic();

  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Employees (Paginated & Searchable)
  const fetchAllEmployees = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployees(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Employees by Branch (Paginated & Searchable)
  const fetchEmployeesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployees(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Employee Details By ID
  const fetchEmployeeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setEmployeeDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Employee
  const createEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...employeeData, branch: employeeData.branch || branch };
      
      const response = await axiosPublic.post(`${API}/post`, payload);
      
      const result = response.data;
      // Axios throws on error automatically
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so components can handle form submission errors
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // PUT: Update a Employee
  const updateEmployee = useCallback(async (id, employeeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, employeeData);
      
      const result = response.data;
      // Axios throws on error automatically
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE: Remove a Employee
  const removeEmployee = useCallback(async (id) => {
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
  }, []);



  return {
    employees,
    employeeDetails,
    pagination,
    loading,
    error,
    fetchAllEmployees,
    fetchEmployeesByBranch,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    removeEmployee,
  };  
};

export default useEmployees;