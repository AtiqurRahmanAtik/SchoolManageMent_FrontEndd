import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth";
// Import useAuth from your authentication context path
// import { useAuth } from "../../context/AuthContext"; 

const API = "/notice";

const useNotice = () => {
  const axiosPublic = useAxiosPublic();
  // Assuming useAuth provides the current branch
  const { branch } = useAuth(); 

  const [notices, setNotices] = useState([]);
  const [singleNotice, setSingleNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // 1. Get All Notices (with pagination)
  const getAllNotices = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setNotices(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Get Notices By Branch (with pagination)
  const getNoticesByBranch = useCallback(async (branchName, page = 1, limit = 10) => {
    if (!branchName) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${branchName}/get-all?page=${page}&limit=${limit}`);
      const result = response.data;

      // Axios throws on error automatically

      setNotices(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Get Notice By ID
  const getNoticeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;

      // Axios throws on error automatically

      setSingleNotice(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Create Notice
  const createNotice = useCallback(async (noticeData) => {
    setLoading(true);
    setError(null);
    try {

        const payload = { ...noticeData, branch: noticeData.branch || branch };
      
      const response = await axiosPublic.post(`${API}/post`, payload);
      const result = response.data;

      // Axios throws on error automatically

      return result;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw to handle in component (e.g., showing a toast)
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. Update Notice
  const updateNotice = useCallback(async (id, noticeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, noticeData);
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

  // 6. Delete Notice
  const removeNotice = useCallback(async (id) => {
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
    notices,
    singleNotice,
    loading,
    error,
    pagination,
    getAllNotices,
    getNoticesByBranch,
    getNoticeById,
    createNotice,
    updateNotice,
    removeNotice,
  };
};

export default useNotice;