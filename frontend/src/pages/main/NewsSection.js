import { useState, useEffect } from "react";
import { FiX, FiImage, FiUpload, FiClock, FiBookmark } from "react-icons/fi";
import MySwal from "sweetalert2";
import { createNewsArticle, getNewsArticles } from "../../api/newsApi";

const NewspaperSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArticle, setNewArticle] = useState({
    headline: "",
    content: "",
    image: null,
    imagePreview: "",
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });
  const [errors, setErrors] = useState({
    headline: '',
    content: '',
    image: ''
  });

  // Validation functions
  const validateHeadline = (headline) => {
    if (!headline.trim()) return "Headline is required";
    if (headline.length > 100) return "Headline must be less than 100 characters";
    return "";
  };

  const validateContent = (content) => {
    if (!content.trim()) return "Story content is required";
    if (content.length < 50) return "Story should be at least 50 characters";
    return "";
  };

  // Fetch articles from backend on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getNewsArticles();
        setArticles(
          data.map((article) => ({
            id: article.id || article._id,
            headline: article.headline,
            content: article.story,
            imageUrl: article.imagePath
              ? `http://localhost:3001${article.imagePath}`
              : null,
            date: article.createdAt
              ? new Date(article.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }))
        );
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: "Failed to load articles",
          icon: "error",
          confirmButtonColor: "#3B82F6"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleHeadlineChange = (e) => {
    const value = e.target.value;
    setNewArticle(prev => ({ ...prev, headline: value }));
    setErrors(prev => ({ ...prev, headline: validateHeadline(value) }));
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setNewArticle(prev => ({ ...prev, content: value }));
    setErrors(prev => ({ ...prev, content: validateContent(value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, image: "Please upload an image file (JPEG, PNG)" }));
        return;
      }
      
      // Validate image size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image must be less than 5MB" }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewArticle(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
        setErrors(prev => ({ ...prev, image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewArticle(prev => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
    setErrors(prev => ({ ...prev, image: "Please upload an image" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const headlineError = validateHeadline(newArticle.headline);
    const contentError = validateContent(newArticle.content);
    const imageError = !newArticle.image ? "Please upload an image" : "";
    
    setErrors({
      headline: headlineError,
      content: contentError,
      image: imageError
    });
    
    // If any errors exist, stop submission
    if (headlineError || contentError || imageError) {
      return;
    }

    try {
      // Show loading alert
      MySwal.fire({
        title: "Publishing Article...",
        html: "Please wait while we publish your article",
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });
      
      // Submit to backend
      const created = await createNewsArticle({
        headline: newArticle.headline,
        story: newArticle.content,
        image: newArticle.image,
      });
      
      setArticles((prev) => [
        {
          id: created.id || created._id,
          headline: created.headline,
          content: created.story,
          imageUrl: created.imagePath
            ? `http://localhost:3001${created.imagePath}`
            : null,
          date: created.createdAt
            ? new Date(created.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      
      // Reset form
      setNewArticle({
        headline: "",
        content: "",
        image: null,
        imagePreview: "",
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
      
      // Show success alert
      MySwal.fire({
        title: "Published!",
        text: "Your article has been published successfully",
        icon: "success",
        confirmButtonColor: "#10B981",
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: "Failed to publish article. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Newspaper Header */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              The Reclaim Chronicle
            </h1>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <FiBookmark className="mr-1" /> Vol. 1, No. 1
              </span>
              <span className="flex items-center">
                <FiClock className="mr-1" /> {new Date().toLocaleDateString()}
              </span>
              <span>Free Edition</span>
            </div>
          </header>

          {/* Upload Section */}
          <div className="bg-white p-8 mb-12 shadow-xl rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 border-gray-100">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Submit Your News
              </span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Headline Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={newArticle.headline}
                  onChange={handleHeadlineChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.headline ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  placeholder="Enter headline..."
                />
                {errors.headline && (
                  <p className="mt-1 text-sm text-red-600">{errors.headline}</p>
                )}
              </div>
              
              {/* Content Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story
                </label>
                <textarea
                  value={newArticle.content}
                  onChange={handleContentChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.content ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  rows="5"
                  placeholder="Write your story here..."
                ></textarea>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
              
              {/* Image Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                {!newArticle.imagePreview ? (
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <FiUpload className={`text-2xl ${errors.image ? 'text-red-500' : 'text-blue-500'}`} />
                      </div>
                      <p className={`${errors.image ? 'text-red-500' : 'text-gray-500'}`}>
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400">JPEG, PNG (Max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={newArticle.imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                    >
                      <FiX className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
              >
                Publish Article
              </button>
            </form>
          </div>

          {/* Newspaper Articles */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-3 border-b border-gray-200">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Latest News
              </span>
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <FiImage className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500">No articles yet. Be the first to publish!</p>
              </div>
            ) : (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {article.imageUrl && (
                      <div className="md:w-1/3">
                        <div className="overflow-hidden rounded-lg aspect-video bg-gray-100">
                          <img
                            src={article.imageUrl}
                            alt="Article visual"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                    <div className={`${article.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {article.date}
                      </p>
                      <h3 className="text-2xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                        {article.headline}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {article.content ||
                          "No content provided. An image tells a thousand words!"}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Newspaper Footer */}
          <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} The Reclaim Chronicle - All Rights Reserved
            </p>
            <p className="mt-1">"Bringing lost items back to their owners since 2023"</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default NewspaperSection;