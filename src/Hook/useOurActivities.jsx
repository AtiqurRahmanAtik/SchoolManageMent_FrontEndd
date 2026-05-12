import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/our-activities";

export const useOurActivities = () => {
  const axiosPublic = useAxiosPublic();

  const [ourActivities, setOurActivities] = useState([]);
  const [ourActivityDetails, setOurActivityDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Our Activities (Paginated & Searchable)
  const fetchAllOurActivities = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setOurActivities(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Our Activities by Branch (Paginated & Searchable)
  const fetchOurActivitiesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setOurActivities(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Our Activity Details By ID
  const fetchOurActivityById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setOurActivityDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Our Activity
  const createOurActivity = useCallback(async (ourActivityData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...ourActivityData, branch: ourActivityData.branch || branch };
      
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

  // PUT: Update an Our Activity
  const updateOurActivity = useCallback(async (id, ourActivityData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, ourActivityData);
      
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

  // DELETE: Remove an Our Activity
  const removeOurActivity = useCallback(async (id) => {
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
    ourActivities,
    ourActivityDetails,
    pagination,
    loading,
    error,
    fetchAllOurActivities,
    fetchOurActivitiesByBranch,
    fetchOurActivityById,
    createOurActivity,
    updateOurActivity,
    removeOurActivity,
  };  
};

export default useOurActivities;