import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import useAuth from "./useAuth";
// Adjust the import path for useAuth based on your project structure

const API = "/sections";

export const useSection = () => {
  const { branch } = useAuth();
  const axiosSecure = UseAxiosSecure();

  const [sections, setSections] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sections by branch
  const getSections = useCallback(async (page = 1, limit = 10) => {
    if (!branch) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosSecure.get(`${API}/${branch}/get-all`, {
        params: { page, limit },
      });
      setSections(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // Create a new section
  const addSection = async (sectionData) => {
    setLoading(true);
    setError(null);
    try {
      // Sends: { sectionName, classId, className, branch }
      const response = await axiosSecure.post(`${API}/post`, { ...sectionData, branch });
      setSections((prev) => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update a section
  const updateSection = async (id, sectionData) => {
    setLoading(true);
    setError(null);
    try {
      // Sends: { sectionName, classId, className, branch }
      const response = await axiosSecure.put(`${API}/update/${id}`, { ...sectionData, branch });
      setSections((prev) =>
        prev.map((section) => (section._id === id ? response.data : section))
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete a section
  const deleteSection = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosSecure.delete(`${API}/delete/${id}`);
      setSections((prev) => prev.filter((section) => section._id !== id));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    sections,
    pagination,
    loading,
    error,
    getSections,
    addSection,
    updateSection,
    deleteSection,
  };
};

export default useSection;