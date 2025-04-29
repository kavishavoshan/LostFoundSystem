import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/UI/Header";
import Footer from "../../components/UI/Footer";
import Swal from "sweetalert2";
import logo from "../../images/image.jpg";
import comunity from "../../images/comunity.jpg";

function Community() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    title: "",
    content: "",
    rating: 5,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews"); // reviews, success-stories, or tips

  const links = [
    { name: "Report Lost Item", href: "#" },
    { name: "Found Items", href: "#" },
    { name: "View All Items", href: "#" },
    { name: "Success Stories", href: "#" },
  ];

  const stats = [
    { name: "Items Recovered", value: "1,200+" },
    { name: "Happy Users", value: "500+" },
    { name: "Active Volunteers", value: "40" },
    { name: "Days to Recovery", value: "3.5 avg" },
  ];

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load reviews from localStorage (in a real app, this would be an API call)
  useEffect(() => {
    const savedReviews = localStorage.getItem("reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Add some sample reviews if none exist
      const sampleReviews = [
        {
          id: 1,
          title: "Amazing service!",
          content: "I lost my wallet and it was found within 24 hours. The system is so easy to use!",
          rating: 5,
          author: "John Doe",
          date: "2023-05-15",
        },
        {
          id: 2,
          title: "Very helpful community",
          content: "The community here is so supportive. When I lost my phone, several people helped me look for it.",
          rating: 4,
          author: "Jane Smith",
          date: "2023-06-22",
        },
        {
          id: 3,
          title: "Quick recovery",
          content: "My laptop was found and returned to me in just 2 days. The process was smooth and efficient.",
          rating: 5,
          author: "Mike Johnson",
          date: "2023-07-10",
        },
      ];
      setReviews(sampleReviews);
      localStorage.setItem("reviews", JSON.stringify(sampleReviews));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setNewReview({
      ...newReview,
      rating,
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to submit a review",
        icon: "info",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all fields",
        icon: "error",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      const review = {
        id: Date.now(),
        title: newReview.title,
        content: newReview.content,
        rating: newReview.rating,
        author: user.name,
        date: new Date().toISOString().split("T")[0],
      };

      const updatedReviews = [review, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem("reviews", JSON.stringify(updatedReviews));

      setNewReview({
        title: "",
        content: "",
        rating: 5,
      });

      setIsSubmitting(false);

      Swal.fire({
        title: "Review Submitted!",
        text: "Thank you for your feedback",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }, 1000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const renderReviews = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newReview.title}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Give your review a title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                Your Review
              </label>
              <textarea
                id="content"
                name="content"
                value={newReview.content}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="Tell us about your experience with our service"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl focus:outline-none ${
                      star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6">Community Reviews</h3>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-semibold">{review.title}</h4>
                    <div className="flex items-center">
                      <div className="mr-2">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{review.content}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    By <span className="font-medium">{review.author}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessStories = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Share Your Success Story</h3>
          <p className="text-gray-700 mb-4">
            Did you recover a lost item through our service? Share your story to inspire others!
          </p>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                Swal.fire({
                  title: "Login Required",
                  text: "Please log in to share your story",
                  icon: "info",
                  confirmButtonText: "Login",
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate("/login");
                  }
                });
                return;
              }
              // In a real app, this would open a form or modal
              Swal.fire({
                title: "Coming Soon!",
                text: "This feature will be available soon. Stay tuned!",
                icon: "info",
              });
            }}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Share Your Story
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6">Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold">Lost Wallet Found in 24 Hours</h4>
              <p className="mt-2 text-gray-700">
                "I lost my wallet at the mall and thought it was gone forever. Thanks to this service, someone found it and returned it to me within 24 hours. Everything was still inside!"
              </p>
              <div className="mt-4 text-sm text-gray-500">
                By <span className="font-medium">Sarah Johnson</span> • <span>May 15, 2023</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold">Phone Recovered After a Week</h4>
              <p className="mt-2 text-gray-700">
                "My phone fell out of my pocket during a concert. A week later, someone found it and contacted me through this platform. I'm so grateful for this service!"
              </p>
              <div className="mt-4 text-sm text-gray-500">
                By <span className="font-medium">Michael Brown</span> • <span>June 22, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTips = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Share Your Tips</h3>
          <p className="text-gray-700 mb-4">
            Have advice for preventing lost items or finding them faster? Share your tips with the community!
          </p>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                Swal.fire({
                  title: "Login Required",
                  text: "Please log in to share your tips",
                  icon: "info",
                  confirmButtonText: "Login",
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate("/login");
                  }
                });
                return;
              }
              // In a real app, this would open a form or modal
              Swal.fire({
                title: "Coming Soon!",
                text: "This feature will be available soon. Stay tuned!",
                icon: "info",
              });
            }}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Share Your Tips
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6">Community Tips</h3>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold">Always Take Photos of Important Items</h4>
              <p className="mt-2 text-gray-700">
                "I always take photos of my important items before leaving home. If something gets lost, having a recent photo makes it much easier to identify and recover."
              </p>
              <div className="mt-4 text-sm text-gray-500">
                By <span className="font-medium">Emily Davis</span> • <span>July 10, 2023</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold">Use Bluetooth Trackers</h4>
              <p className="mt-2 text-gray-700">
                "I attach Bluetooth trackers to my keys, wallet, and laptop. If I lose them, I can use my phone to locate them quickly. It's been a game-changer!"
              </p>
              <div className="mt-4 text-sm text-gray-500">
                By <span className="font-medium">David Wilson</span> • <span>August 5, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Community</h1>
          
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "reviews"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab("success-stories")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "success-stories"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Success Stories
                </button>
                <button
                  onClick={() => setActiveTab("tips")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "tips"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tips & Advice
                </button>
              </nav>
            </div>
          </div>
          
          <div className="mt-6">
            {activeTab === "reviews" && renderReviews()}
            {activeTab === "success-stories" && renderSuccessStories()}
            {activeTab === "tips" && renderTips()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Community;
