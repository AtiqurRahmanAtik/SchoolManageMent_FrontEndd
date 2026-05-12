import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/salary";

export const useSalary = () => {
  const axiosPublic = useAxiosPublic();

  const [salaries, setSalaries] = useState([]);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  const fetchAllSalaries = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit, search });
      const response = await axiosPublic.get(`${API}/?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSalaries(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalariesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    if (!targetBranch) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit, search });
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSalaries(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  const fetchSalaryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSalaryDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSalary = useCallback(async (salaryData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...salaryData, branch: salaryData.branch || branch };
      
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
  }, [branch]);

  const updateSalary = useCallback(async (id, salaryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, salaryData);
      
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

  const removeSalary = useCallback(async (id) => {
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
    salaries,
    salaryDetails,
    pagination,
    loading,
    error,
    fetchAllSalaries,
    fetchSalariesByBranch,
    fetchSalaryById,
    createSalary,
    updateSalary,
    removeSalary,
  };
};

export default useSalary;