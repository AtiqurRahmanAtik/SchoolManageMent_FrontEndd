import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Adjust the import path as necessary

const API = "/aboutus";

export const useAboutUs = () => {
  const axiosPublic = useAxiosPublic();

  const [aboutUsList, setAboutUsList] = useState([]);
  const [aboutUsDetails, setAboutUsDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All About Us (Paginated)
  const fetchAllAboutUs = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setAboutUsList(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All About Us by Branch (Paginated)
  const fetchAboutUsByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setAboutUsList(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single About Us Details By ID
  const fetchAboutUsById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setAboutUsDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new About Us
  const createAboutUs = useCallback(async (aboutUsData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...aboutUsData, branch: aboutUsData.branch || branch };
      
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

  // PUT: Update an About Us
  const updateAboutUs = useCallback(async (id, aboutUsData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, aboutUsData);
      
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

  // DELETE: Remove an About Us
  const removeAboutUs = useCallback(async (id) => {
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
    aboutUsList,
    aboutUsDetails,
    pagination,
    loading,
    error,
    fetchAllAboutUs,
    fetchAboutUsByBranch,
    fetchAboutUsById,
    createAboutUs,
    updateAboutUs,
    removeAboutUs,
  };  
};

export default useAboutUs;