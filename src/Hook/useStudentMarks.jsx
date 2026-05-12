import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/student-marks";

export const useStudentMarks = () => {
  const axiosPublic = useAxiosPublic();

  const [marks, setMarks] = useState([]);
  const [markDetails, setMarkDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Student Marks (Paginated)
  const fetchAllMarks = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setMarks(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET: Student Marks by Branch (Paginated)
  const fetchMarksByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(
        `${API}/${targetBranch}/get-all?page=${page}&limit=${limit}`
      );
      const result = response.data;
      
      // Axios throws on error automatically
      
      setMarks(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Mark Detail By ID
  const fetchMarkById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setMarkDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Student Mark (Updated for Array-Based Logic)
  const createMark = useCallback(async (markData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...markData, branch: markData.branch || branch };
      
      const response = await axiosPublic.post(`${API}/post`, payload);
      
      const result = response.data;
      // Axios throws on error automatically
      
      // Since it uses upsert, we refresh the list or find the student in state
      setMarks((prev) => {
        const index = prev.findIndex(item => item.studentId === result.studentId);
        if (index > -1) {
          const newMarks = [...prev];
          newMarks[index] = result;
          return newMarks;
        }
        return [result, ...prev];
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err; 
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // PUT: Update a Student Mark (Updated for Array positional update)
  // Expects 'resultId' inside markData to identify which exam record to update
  const updateMark = useCallback(async (id, markData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, markData);
      
      const result = response.data;
      // Axios throws on error automatically
      
      setMarks((prev) => prev.map((item) => (item._id === id ? result : item)));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE: Remove a Student Mark record (Updated to remove entry from array)
  // Expects resultId to be passed to identify the specific exam entry
  const removeMark = useCallback(async (id, resultId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.delete(`${API}/delete/${id}`);
      
      const result = response.data;
      // Axios throws on error automatically
      
      // Update local state with the returned updated student document
      setMarks((prev) => prev.map((item) => (item._id === id ? result.data : item)));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    marks,
    markDetails,
    pagination,
    loading,
    error,
    fetchAllMarks,
    fetchMarksByBranch,
    fetchMarkById,
    createMark,
    updateMark,
    removeMark,
  };
};

export default useStudentMarks;