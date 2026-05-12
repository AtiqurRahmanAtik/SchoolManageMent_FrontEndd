import useAxiosPublic from "./useAxiosPublic";
// src/hooks/useInstituteProfile.js
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Adjust path as needed

const API = "/institute-profile";

export const useInstituteProfile = () => {
  const axiosPublic = useAxiosPublic();

  const [instituteProfiles, setInstituteProfiles] = useState([]);
  const [instituteProfileDetails, setInstituteProfileDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth();

  // GET: All Institute Profiles (Paginated)
  const fetchAllInstituteProfiles = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/?page=${page}&limit=${limit}`);
      const result = response.data;

      // Axios throws on error automatically

      setInstituteProfiles(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET: All Institute Profiles by Branch (Paginated)
  const fetchInstituteProfilesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?page=${page}&limit=${limit}`);
      const result = response.data;

      // Axios throws on error automatically

      setInstituteProfiles(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Institute Profile By ID
  const fetchInstituteProfileById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;

      // Axios throws on error automatically

      setInstituteProfileDetails(result);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Institute Profile
  const createInstituteProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...profileData, branch: profileData.branch || branch };

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

  // PUT: Update an Institute Profile
  const updateInstituteProfile = useCallback(async (id, profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, profileData);

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

  // DELETE: Remove an Institute Profile
  const removeInstituteProfile = useCallback(async (id) => {
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
    instituteProfiles,
    instituteProfileDetails,
    pagination,
    loading,
    error,
    fetchAllInstituteProfiles,
    fetchInstituteProfilesByBranch,
    fetchInstituteProfileById,
    createInstituteProfile,
    updateInstituteProfile,
    removeInstituteProfile,
  };
};

export default useInstituteProfile;