import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from 'react';
import useAuth from './useAuth';


const API = "/employee-roles";

const useEmployeeRole = () => {
  const axiosPublic = useAxiosPublic();
  const { branch } = useAuth();
  
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Fetch all roles (Optional, if you want to see globally across branches)
  const getAllEmployeeRoles = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}?page=${page}&limit=${limit}`);
      // Axios throws on error automatically
      
      const result = response.data;
      if (result.success) {
        setEmployeeRoles(result.data);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch roles by specific branch (Default use case)
  const getEmployeeRolesByBranch = useCallback(async (page = 1, limit = 10) => {
    if (!branch) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/${branch}/get-all?page=${page}&limit=${limit}`);
      // Axios throws on error automatically
      
      const result = response.data;
      if (result.success) {
        setEmployeeRoles(result.data);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // Get a single employee role by ID
  const getEmployeeRoleById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      // Axios throws on error automatically
      
      const result = response.data;
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new employee role
  const createEmployeeRole = async (roleData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.post(`${API}/post`, { ...roleData, branch });
      
      // Axios throws on error automatically
      
      const newRole = response.data;
      
      // Update local state to reflect the addition immediately
      setEmployeeRoles((prev) => [newRole, ...prev]);
      return newRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing employee role
  const updateEmployeeRole = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, updatedData);
      
      // Axios throws on error automatically
      
      const updatedRole = response.data;
      
      // Update local state
      setEmployeeRoles((prev) =>
        prev.map((role) => (role._id === id ? updatedRole : role))
      );
      return updatedRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an employee role
  const removeEmployeeRole = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.delete(`${API}/delete/${id}`);
      
      // Axios throws on error automatically
      
      // Remove from local state
      setEmployeeRoles((prev) => prev.filter((role) => role._id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    employeeRoles,
    pagination,
    loading,
    error,
    getAllEmployeeRoles,
    getEmployeeRolesByBranch,
    getEmployeeRoleById,
    createEmployeeRole,
    updateEmployeeRole,
    removeEmployeeRole,
  };
};

export default useEmployeeRole;