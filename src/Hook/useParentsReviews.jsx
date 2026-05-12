import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Adjust the import path as necessary

const API = "/parents-reviews";

export const useParentsReviews = () => {
  const axiosPublic = useAxiosPublic();

  const [parentsReviews, setParentsReviews] = useState([]);
  const [parentsReviewDetails, setParentsReviewDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Parents Reviews (Paginated)
  const fetchAllParentsReviews = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setParentsReviews(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Parents Reviews by Branch (Paginated)
  const fetchParentsReviewsByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setParentsReviews(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Parents Review Details By ID
  const fetchParentsReviewById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setParentsReviewDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Parents Review
  const createParentsReview = useCallback(async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...reviewData, branch: reviewData.branch || branch };
      
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

  // PUT: Update a Parents Review
  const updateParentsReview = useCallback(async (id, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, reviewData);
      
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

  // DELETE: Remove a Parents Review
  const removeParentsReview = useCallback(async (id) => {
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
    parentsReviews,
    parentsReviewDetails,
    pagination,
    loading,
    error,
    fetchAllParentsReviews,
    fetchParentsReviewsByBranch,
    fetchParentsReviewById,
    createParentsReview,
    updateParentsReview,
    removeParentsReview,
  };  
};

export default useParentsReviews;