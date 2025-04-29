import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profile from "../../images/profile.jpg";
import { getCurrentUser, updateUserProfile, getUserReviews, uploadProfileImage } from "../../api/user";
import { getAuthToken } from "../../api/auth";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // User data state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile data states
  const [coverImage, setCoverImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState("/img/avatar1.jpg");
  const [uploadError, setUploadError] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    twitter: "",
    facebook: "",
  });
  const [editMode, setEditMode] = useState(false);
  
  // User content states
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("profile"); // profile, reviews

  // Refs
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Fetch user reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === "reviews") {
      const fetchReviews = async () => {
        try {
          const response = await getUserReviews();
          if (response.success) {
            setReviews(response.data);
          } else {
            throw new Error(response.message || 'Failed to fetch reviews');
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load reviews. Please try again later.'
          });
        }
      };

      fetchReviews();
    }
  }, [activeTab]);

  // Check if user is logged in and fetch user data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Try to get user data from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setPhoneNumber(parsedUser.mobileNumber || "");
          setAvatarImage(parsedUser.avatar || "/img/avatar1.jpg");
          setCoverImage(parsedUser.coverImage || null);
          setAboutText(parsedUser.about || "");
          setSocialLinks({
            github: parsedUser.socialLinks?.github || "",
            twitter: parsedUser.socialLinks?.twitter || "",
            facebook: parsedUser.socialLinks?.facebook || "",
          });
        }

        // Fetch fresh data from the server
        const response = await getCurrentUser();
        if (response && response.success && response.data) {
          const userData = response.data;
          setUser(userData);
          setPhoneNumber(userData.mobileNumber || "");
          setAvatarImage(userData.avatar || "/img/avatar1.jpg");
          setCoverImage(userData.coverImage || null);
          setAboutText(userData.about || "");
          setSocialLinks({
            github: userData.socialLinks?.github || "",
            twitter: userData.socialLinks?.twitter || "",
            facebook: userData.socialLinks?.facebook || "",
          });
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle image uploads
  const handleImageUpload = async (e, setImage, type = 'avatar') => {
    const file = e.target.files[0];
    setUploadError("");

    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setUploadError("Please select an image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large (max 5MB)");
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      // Upload the image
      const response = await uploadProfileImage(file, type);
      console.log('Upload response in component:', response);
      
      // Update the image preview
      if (response && response.profilePicture) {
        setImage(response.profilePicture);
        
        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Profile image updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      setUploadError("Failed to upload image. Please try again.");
      Swal.fire({
        title: "Error",
        text: "Failed to upload image. Please try again.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger file inputs
  const triggerCoverInput = () => coverInputRef.current.click();
  const triggerAvatarInput = () => avatarInputRef.current.click();

  // Handle social link changes
  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  // Save social links
  const saveSocialLinks = async () => {
    try {
      await updateUserProfile({ socialLinks });
      setEditMode(false);
      Swal.fire({
        title: "Success!",
        text: "Social links updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update social links. Please try again.",
        icon: "error"
      });
    }
  };

  // Save about text
  const saveAboutText = async () => {
    try {
      await updateUserProfile({ about: aboutText });
      setIsEditingAbout(false);
      Swal.fire({
        title: "Success!",
        text: "About section updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update about section. Please try again.",
        icon: "error"
      });
    }
  };

  // Save phone number
  const savePhoneNumber = async () => {
    try {
      const response = await updateUserProfile({
        mobileNumber: phoneNumber
      });
      
      if (response.success) {
        // Update local user data
        const updatedUser = { ...user, mobileNumber: phoneNumber };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditingPhone(false);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Phone number updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.message || 'Failed to update phone number');
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update phone number. Please try again.'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Render user not found state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">User not found!</strong>
          <span className="block sm:inline"> Please log in again.</span>
        </div>
      </div>
    );
  }

  // Render profile tab
  const renderProfileTab = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Cover Image Section */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full bg-gray-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-secondary to-secondary flex items-center justify-center">
              <span className="text-white text-lg font-medium"></span>
            </div>
          )}
          
          {/* Cover Image Upload Button */}
          <button
            onClick={triggerCoverInput}
            className="absolute bottom-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {coverImage ? "Change Cover" : "Add Cover"}
          </button>
          <input
            type="file"
            ref={coverInputRef}
            onChange={(e) => handleImageUpload(e, setCoverImage, 'cover')}
            className="hidden"
            accept="image/*"
          />
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative -mt-20">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden">
                <img
                  src={avatarImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={triggerAvatarInput}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleImageUpload(e, setAvatarImage, 'avatar')}
                className="hidden"
                accept="image/*"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              
              {/* Phone Number Section */}
              <div className="mt-4">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Enter phone number"
                      />
                      <button
                        onClick={savePhoneNumber}
                        className="text-primary hover:text-blue-700 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhoneNumber(user.mobileNumber || "");
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{phoneNumber || "No phone number"}</span>
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="text-primary hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Links Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <input
                  type="text"
                  value={socialLinks.github}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="GitHub URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Twitter URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Facebook URL"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveSocialLinks}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Social Links
                </button>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              {!isEditingAbout && (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="text-primary hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
            </div>
            
            {isEditingAbout ? (
              <div className="space-y-4">
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full border rounded-md p-3 min-h-[150px]"
                  placeholder="Tell us about yourself..."
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingAbout(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAboutText}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save About
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line">
                {aboutText || "No information provided yet."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render reviews tab
  const renderReviewsTab = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{review.title}</h3>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-gray-500">You haven't written any reviews yet.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/community')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Write a Review
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`${
              activeTab === "reviews"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Reviews
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === "profile" && renderProfileTab()}
      {activeTab === "reviews" && renderReviewsTab()}
      
      {/* Add logout button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </section>
  );
}

export default Profile;
