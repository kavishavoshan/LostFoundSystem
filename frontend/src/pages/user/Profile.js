import React, { useState, useRef } from "react";
import profile from "../../images/profile.jpg"

function Profile() {
  // Image states
  const [coverImage, setCoverImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState("/img/avatar1.jpg");
  const [uploadError, setUploadError] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    twitter: "",
    facebook: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Refs
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = (e, setImage) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.onerror = () => {
      setUploadError("Error reading file");
    };
    reader.readAsDataURL(file);
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
  const saveSocialLinks = () => {
    setEditMode(false);
    // Here you would typically save to a backend
    console.log("Social links saved:", socialLinks);
  };

  // Save about text
  const saveAboutText = () => {
    setIsEditingAbout(false);
    // Here you would typically save to a backend
    console.log("About text saved:", aboutText);
  };

  return (
    <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

          {/* Cover Upload Button */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={triggerCoverInput}
              className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              {coverImage ? "Change Cover" : "Upload Cover"}
            </button>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setCoverImage)}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-4">
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {uploadError}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center w-full md:w-auto -mt-20">
              <div className="relative group">
                <img
                  src={profile}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover"
                />
                <button
                  onClick={triggerAvatarInput}
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors group-hover:opacity-100 opacity-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setAvatarImage)}
                  className="hidden"
                />
              </div>
              <div className="text-center mt-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  Thinal Dilmith
                </h1>
                <p className="text-lg text-gray-600 mt-1">thinaldilmith2002@gmail.com</p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="flex flex-col gap-3 w-full md:w-auto md:ml-auto">
              {editMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <input
                      type="text"
                      value={socialLinks.github}
                      onChange={(e) =>
                        handleSocialLinkChange("github", e.target.value)
                      }
                      placeholder="GitHub profile URL"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <input
                      type="text"
                      value={socialLinks.twitter}
                      onChange={(e) =>
                        handleSocialLinkChange("twitter", e.target.value)
                      }
                      placeholder="Twitter profile URL"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                    <input
                      type="text"
                      value={socialLinks.facebook}
                      onChange={(e) =>
                        handleSocialLinkChange("facebook", e.target.value)
                      }
                      placeholder="Facebook profile URL"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSocialLinks}
                      className="px-3 py-1 text-sm text-white bg-primary rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save Links
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                    {socialLinks.github && (
                      <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="self-end mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit links
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-3 relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">About Me</h2>
              {!isEditingAbout && (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit About
                </button>
              )}
            </div>

            {isEditingAbout ? (
              <div className="space-y-3">
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-600 leading-relaxed"
                  rows="1"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingAbout(false)}
                    className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAboutText}
                    className="px-3 py-1 text-sm text-white bg-primary rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Save About
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line">
                {aboutText}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
