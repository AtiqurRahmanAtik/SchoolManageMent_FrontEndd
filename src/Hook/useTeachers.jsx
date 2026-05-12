import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; // Adjust the import path

const API = "/teachers";

export default function useTeachers() {
  const axiosPublic = useAxiosPublic();
  const { branch } = useAuth();
  
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all teachers
  const fetchTeachers = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const url = branch 
        ? `${API}/${branch}/get-all?page=${page}&limit=${limit}`
        : `${API}?page=${page}&limit=${limit}`;

      const response = await axiosPublic.get(url);
      const result = response.data;

      setTeachers(result.data);
      setPagination({
        ...result.pagination,
        currentPage: page,     // Ensure current page matches request
        itemsPerPage: limit    // Ensure current limit matches request
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // Fetch a single teacher by ID
  const getTeacherById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;

      // Axios throws on error automatically
      
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new teacher
  const createTeacher = async (teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.post(`${API}/post`, { ...teacherData, branch });
      const result = response.data;

      // Axios throws on error automatically

      await fetchTeachers(pagination.currentPage, pagination.itemsPerPage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a teacher
  const updateTeacher = async (id, teacherData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, teacherData);
      const result = response.data;

      // Axios throws on error automatically

      await fetchTeachers(pagination.currentPage, pagination.itemsPerPage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a teacher
  const removeTeacher = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.delete(`${API}/delete/${id}`);
      const result = response.data;

      // Axios throws on error automatically

      await fetchTeachers(pagination.currentPage, pagination.itemsPerPage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  
  return {
    teachers,
    pagination,
    loading,
    error,
    fetchTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    removeTeacher,
  };
}