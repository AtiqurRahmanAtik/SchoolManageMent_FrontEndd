import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/subjects";

export const useSubject = () => {
  const axiosPublic = useAxiosPublic();

  const [subjects, setSubjects] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Subjects (Paginated & Searchable)
  const fetchAllSubjects = useCallback(async (search = "", page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      // Build dynamic query parameters
      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.append("search", search);

      const response = await axiosPublic.get(`${API}/?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSubjects(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Subjects by Branch (Paginated & Searchable)
  const fetchSubjectsByBranch = useCallback(async (targetBranch = branch, search = "", page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      // Build dynamic query parameters
      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.append("search", search);

      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSubjects(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Subject Details By ID
  const fetchSubjectById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setSubjectDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Subject
  const createSubject = useCallback(async (subjectData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...subjectData, branch: subjectData.branch || branch };
      
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

  // PUT: Update a Subject
  const updateSubject = useCallback(async (id, subjectData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, subjectData);
      
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

  // DELETE: Remove a Subject
  const removeSubject = useCallback(async (id) => {
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
    subjects,
    subjectDetails,
    pagination,
    loading,
    error,
    fetchAllSubjects,
    fetchSubjectsByBranch,
    fetchSubjectById,
    createSubject,
    updateSubject,
    removeSubject,
  };
};

export default useSubject;