import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/UI/Footer";
import Swal from "sweetalert2";
import { register } from "../../api/auth";
import PasswordInput from '../../components/UI/PasswordInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        else if (value.length < 3) error = "Name must be at least 3 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email address";
        break;
      case "mobileNumber":
        if (value && !/^[0-9]{10}$/.test(value))
          error = "Please enter a valid 10-digit mobile number";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        else if (!/[A-Z]/.test(value))
          error = "Must contain at least one uppercase letter";
        else if (!/[0-9]/.test(value))
          error = "Must contain at least one number";
        else if (!/[!@#$%^&*]/.test(value))
          error = "Must contain at least one special character";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password)
          error = "Passwords do not match";
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      mobileNumber: validateField("mobileNumber", formData.mobileNumber),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      await Swal.fire({
        title: "Form Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send registration data to the backend
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber || undefined
      };
      
      console.log('Sending registration data:', userData);
      
      const response = await register(userData);
      
      await Swal.fire({
        title: "Registration Successful!",
        text: response.message || "Your account has been created successfully.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      // Navigate to login page after successful registration
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      await Swal.fire({
        title: "Registration Failed",
        text: err.response?.data?.message || "An error occurred during registration.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTermsAlert = () => {
    Swal.fire({
      title: "Terms and Conditions",
      html: `
        <div class="text-left">
          <h3 class="font-bold mb-2">1. Acceptance of Terms</h3>
          <p class="mb-4">By registering, you agree to our terms of service.</p>
          
          <h3 class="font-bold mb-2">2. Privacy Policy</h3>
          <p class="mb-4">Your data will be protected according to our privacy policy.</p>
          
          <h3 class="font-bold mb-2">3. Account Security</h3>
          <p>You are responsible for maintaining the confidentiality of your account.</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "I Understand",
      width: "600px",
    });
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
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 text-base rounded-md shadow-sm ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
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
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-3 text-base rounded-md shadow-sm ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mobile Number (Optional)
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.mobileNumber
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your mobile number (optional)"
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
                )}
              </div>

              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  error={errors.password}
                />
              </div>

              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  label="Confirm Password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  error={errors.confirmPassword}
                />
              </div>

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
                  <button
                    type="button"
                    onClick={showTermsAlert}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex justify-center w-full px-4 py-2 text-lg font-medium text-white border border-transparent rounded-md shadow-sm bg-neutral-900 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
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