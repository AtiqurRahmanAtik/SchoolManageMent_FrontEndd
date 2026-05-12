import useAxiosPublic from "./useAxiosPublic";
import { useState, useCallback } from "react";
import useAuth from "./useAuth"; 

// Updated to match backend registration: routes.use("/grades", GradeRoutes);
const API = "/grades";

export const useGrade = () => {
  const axiosPublic = useAxiosPublic();

  const [grades, setGrades] = useState([]);
  const [gradeDetails, setGradeDetails] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { branch } = useAuth(); 

  // GET: All Grades (Paginated)
  // Matches backend: GradeRoutes.get("/", getAllGrades);
  const fetchAllGrades = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit, search });
      const response = await axiosPublic.get(`${API}/?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setGrades(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET: All Grades by Branch 
  // Matches backend: GradeRoutes.get("/:branch/get-all", getGradesByBranch);
  const fetchGradesByBranch = useCallback(async (targetBranch = branch, page = 1, limit = 10, search = "") => {
    if (!targetBranch) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page, limit, search });
      
      // matches /grades/:branch/get-all
      const response = await axiosPublic.get(`${API}/${targetBranch}/get-all?${queryParams.toString()}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setGrades(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch]);

  // GET: Single Grade Details By ID
  // Matches backend: GradeRoutes.get("/get-id/:id", getGradeById);
  const fetchGradeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get(`${API}/get-id/${id}`);
      const result = response.data;
      
      // Axios throws on error automatically
      
      setGradeDetails(result.data);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST: Create a new Grade
  // Matches backend: GradeRoutes.post("/post", createGrade);
  const createGrade = useCallback(async (gradeData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...gradeData, branch: gradeData.branch || branch };
      
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

  // PUT: Update a Grade
  // Matches backend: GradeRoutes.put("/update/:id", updateGrade);
  const updateGrade = useCallback(async (id, gradeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.put(`${API}/update/${id}`, gradeData);
      
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

  // DELETE: Remove a Grade
  // Matches backend: GradeRoutes.delete("/delete/:id", removeGrade);
  const removeGrade = useCallback(async (id) => {
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
    grades,
    gradeDetails,
    pagination,
    loading,
    error,
    fetchAllGrades,
    fetchGradesByBranch,
    fetchGradeById,
    createGrade,
    updateGrade,
    removeGrade,
  };
};

export default useGrade;