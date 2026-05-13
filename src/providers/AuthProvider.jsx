import { createContext, useState } from "react";
import PropTypes from "prop-types";

import useAxiosPublic from "../Hook/useAxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosPublic();

  const [branch, setBranch] = useState(() => {
    const storedBranch = localStorage.getItem("authBranch");
    return storedBranch || user?.branch || "Rajshahi";
  });

  // Registration
  const registerUser = async (userData) => {
    console.log("Registering user with data:", userData);
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/post", userData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // LoginUser
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosSecure.post("/user/login", { email, password });
      const data = response.data;

      console.log("Login data : ", data);

      setUser(data.user);
      setBranch(data.user.branch);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authBranch", data.user.branch);
      localStorage.setItem("authToken", data.token);

      return data.user;
    } catch (error) {
      console.error("Actual Login Error:", error.response?.data || error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // LogoutUser
  const logoutUser = async () => {
    setLoading(true);
    try {
      // Optional: Call the backend logout if the user is currently set
      if (user?.email) {
        await axiosSecure.post("/user/logout", { email: user.email });
      }

      // 1. Clear React State
      setUser(null);
      setBranch("teaxo"); // Reset to default branch instead of keeping the old one

      // 2. Clear ALL Local and Session Storage (Removes all cached tokens and data)
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear ALL Browser Cache Storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // 4. Force a hard reload to the home page. 
      // This immediately destroys any in-memory cache (like React Query or local variables) in all pages.
      window.location.href = "/";
      
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    loading,
    branch,
    registerUser,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;