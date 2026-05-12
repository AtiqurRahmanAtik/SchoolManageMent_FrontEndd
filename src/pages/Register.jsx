import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useAuth from "../Hook/useAuth";
// Adjust path if needed

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    role: "staff", // Default role
    branch: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (!formData.phone || !formData.branch) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);

    try {
      // Call registerUser from AuthProvider passing the complete object
      await registerUser(formData);
      
      setLoading(false);
      Swal.fire({
        title: "Registration Successful!",
        text: "The new user has been created.",
        icon: "success",
        confirmButtonColor: "#000",
      });

      // Redirect to login or dashboard after successful registration
      navigate("/login"); 
    } catch (error) {
      setLoading(false);
      console.error("Registration Error:", error);
      
      // Handle email already exists or other backend errors
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      Swal.fire("Error!", errorMsg, "error");
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="rounded-sm shadow-2xl overflow-hidden max-w-lg w-full bg-white">
        <div className="w-full p-8 md:p-10 flex flex-col justify-center text-gray-800">
          
          <h2 className="text-xl md:text-2xl font-serif text-center font-bold tracking-wide text-[#1e293b]">
            Create an Account
          </h2>
          <p className="text-center mb-8 text-gray-500 text-xs md:text-sm">
            Register a new user to the system
          </p>

          <form onSubmit={handleRegister} noValidate>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="01700000000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Role Select */}
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="role">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Branch Input */}
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="branch">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  id="branch"
                  name="branch"
                  type="text"
                  placeholder="e.g. teaxo"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 px-4 uppercase tracking-wider text-sm rounded-sm transition duration-300 ease-in-out
                     bg-black hover:bg-gray-800 text-white shadow-md
                     ${loading ? "opacity-70 cursor-not-allowed" : ""}
                `}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600 flex flex-col gap-3">
              <div>
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-black hover:underline">
                  Sign in here
                </Link>
              </div>
              <div>
                <Link to="/" className="font-medium hover:text-black hover:underline inline-flex items-center gap-1">
                  <span>&larr;</span> Back to Home
                </Link>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;