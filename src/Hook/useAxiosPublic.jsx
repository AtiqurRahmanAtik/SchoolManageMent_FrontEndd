import axios from "axios";

// Append /api to the base URL to match the backend routing structure
const backendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : process.env.REACT_APP_BACKEND_URL;
const axiosPublic = axios.create({
  baseURL: `${backendUrl}/api`,
});

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;