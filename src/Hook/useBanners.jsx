import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

const API = "/banners";

export const useBanners = () => {
  const axiosPublic = useAxiosPublic();

  const [banners, setBanners] = useState([]);
  const [bannerDetails, setBannerDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Banners (Paginated & Searchable)
  const fetchAllBanners = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setBanners(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // GET: All Banners by Branch (Paginated & Searchable)
  const fetchBannersByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setBanners(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Banner Details By ID
  const fetchBannerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setBannerDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Banner
  const createBanner = useCallback(async (bannerData) => {
    setLoading(true);
    setError(null);
    try {
      // Fallback to the authenticated user's branch if not provided in the form
      const payload = { ...bannerData, branch: bannerData.branch || branch };
      
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

  // PUT: Update a Banner
  const updateBanner = useCallback(async (id, bannerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, bannerData);
      
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

  // DELETE: Remove a Banner
  const removeBanner = useCallback(async (id) => {
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
    banners,
    bannerDetails,
    pagination,
    loading,
    error,
    fetchAllBanners,
    fetchBannersByBranch,
    fetchBannerById,
    createBanner,
    updateBanner,
    removeBanner,
  };  
};

export default useBanners;