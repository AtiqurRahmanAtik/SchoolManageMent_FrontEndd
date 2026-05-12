import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/examination";

export const useExamination = () => {
  const axiosPublic = useAxiosPublic();

  const [examinations, setExaminations] = useState([]);
  const [examinationDetails, setExaminationDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Examinations (Paginated)
  const fetchAllExaminations = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit });
      const response = await axiosPublic.get(`${API}/?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setExaminations(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET: All Examinations by Branch (Paginated)
  const fetchExaminationsByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit });
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setExaminations(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Examination Details By ID
  const fetchExaminationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setExaminationDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Examination
  const createExamination = useCallback(async (examinationData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...examinationData, branch: examinationData.branch || branch };
      
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

  // PUT: Update an Examination
  const updateExamination = useCallback(async (id, examinationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, examinationData);
      
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

  // DELETE: Remove an Examination
  const removeExamination = useCallback(async (id) => {
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
    examinations,
    examinationDetails,
    pagination,
    loading,
    error,
    fetchAllExaminations,
    fetchExaminationsByBranch,
    fetchExaminationById,
    createExamination,
    updateExamination,
    removeExamination,
  };
};

export default useExamination;