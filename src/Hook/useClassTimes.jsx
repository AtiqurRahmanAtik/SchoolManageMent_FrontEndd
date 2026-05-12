import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/class-time";

export const useClassTimes = () => {
  const axiosPublic = useAxiosPublic();

  const [classTimes, setClassTimes] = useState([]);
  const [classTimeDetails, setClassTimeDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Class Times (Paginated & Searchable)
  const fetchAllClassTimes = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setClassTimes(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Class Times by Branch (Paginated & Searchable)
  const fetchClassTimesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setClassTimes(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Class Time Details By ID
  const fetchClassTimeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setClassTimeDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Class Time
  const createClassTime = useCallback(async (classTimeData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...classTimeData, branch: classTimeData.branch || branch };
      
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

  // PUT: Update a Class Time
  const updateClassTime = useCallback(async (id, classTimeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, classTimeData);
      
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

  // DELETE: Remove a Class Time
  const removeClassTime = useCallback(async (id) => {
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
    classTimes,
    classTimeDetails,
    pagination,
    loading,
    error,
    fetchAllClassTimes,
    fetchClassTimesByBranch,
    fetchClassTimeById,
    createClassTime,
    updateClassTime,
    removeClassTime,
  };  
};

export default useClassTimes;