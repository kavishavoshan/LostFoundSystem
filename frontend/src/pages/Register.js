import { useState } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Footer from "../components/UI/Footer";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return "All fields are required";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Invalid email address";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex items-center justify-center flex-grow">
        <div className="w-full max-w-md mx-4 my-8 overflow-hidden bg-white rounded-lg shadow-2xl">
          {/* Header Section */}
          <div className="px-8 py-10 bg-stone-950 sm:py-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Create Your Account
              </h2>
              <p className="mt-2 text-lg text-indigo-100">Join our community</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 rounded-md bg-red-50">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-md bg-green-50">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="terms"
                  className="block ml-2 text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Terms and Conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-lg font-medium text-white border border-transparent rounded-md shadow-sm bg-neutral-900 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-1 text-gray-500 bg-white">
                    Already have an account?
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="flex justify-center w-full px-4 py-2 mt-5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in to your account
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
