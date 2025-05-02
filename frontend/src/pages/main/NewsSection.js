import { useState, useEffect } from "react";
import { FiX, FiImage } from "react-icons/fi";
import logo from "../../images/image.jpg";
import { createNewsArticle, getNewsArticles } from "../../api/newsApi"; // Adjust path as needed

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        alert("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewArticle((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewArticle((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newArticle.image) {
      alert("Please upload an image");
      return;
    }
    if (!newArticle.headline || !newArticle.content) {
      alert("Headline and story are required");
      return;
    }
    try {
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
    } catch (error) {
      alert("Failed to publish article");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Newspaper Header */}
          <header className="border-b-4 border-gray-800 mb-6 pb-4">
            <h1 className="text-5xl font-bold text-center mb-2 tracking-tight text-gray-900">
              The Reclaim Found
            </h1>
            <div className="flex justify-between text-sm italic text-gray-600">
              <span>Vol. 1, No. 1</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span>Free Edition</span>
            </div>
          </header>

          {/* Upload Section */}
          <div className="bg-gray-100 p-6 mb-8 shadow-lg border border-gray-300 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-800 pb-2 text-gray-900">
              Submit Your News
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-lg mb-2 text-gray-800">
                  Headline
                </label>
                <input
                  type="text"
                  value={newArticle.headline}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  className="w-full p-2 border-b-2 border-gray-800 bg-transparent focus:outline-none text-xl text-gray-900"
                  placeholder="Enter headline..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg mb-2 text-gray-800">Story</label>
                <textarea
                  value={newArticle.content}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full p-2 border-b-2 border-gray-800 bg-transparent focus:outline-none text-gray-900"
                  rows="4"
                  placeholder="Write your story here..."
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-lg mb-2 text-gray-800">
                  Featured Image
                </label>
                {!newArticle.imagePreview ? (
                  <div className="border-2 border-dashed border-gray-400 p-8 text-center rounded-lg">
                    <label className="cursor-pointer">
                      <FiImage className="mx-auto text-4xl text-gray-500 mb-2" />
                      <p className="text-gray-500">Click to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={newArticle.imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover border border-gray-400 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white bg-opacity-80 text-gray-800 p-1 rounded-full"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-gray-800 text-white px-6 py-3 text-lg font-semibold hover:bg-gray-700 transition rounded-lg"
              >
                Publish Article
              </button>
            </form>
          </div>

          {/* Newspaper Articles */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold border-b-2 border-gray-800 pb-2 text-gray-900">
              Latest News
            </h2>
            {loading ? (
              <div className="text-center py-12 italic text-gray-500">
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 italic text-gray-500">
                No articles yet. Be the first to publish!
              </div>
            ) : (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="mb-8 pb-8 border-b border-gray-300 last:border-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-3xl font-bold mb-2 leading-tight text-gray-900">
                        {article.headline}
                      </h3>
                      <p className="text-sm italic mb-4 text-gray-600">
                        Published on {article.date}
                      </p>
                      <p className="text-lg leading-relaxed text-gray-800">
                        {article.content ||
                          "No content provided. An image tells a thousand words!"}
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      {article.imageUrl && (
                        <img
                          src={article.imageUrl}
                          alt="Article visual"
                          className="w-full h-64 object-cover border border-gray-300 shadow-md rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Newspaper Footer */}
          <footer className="mt-12 pt-4 border-t-4 border-gray-800 text-center text-sm italic text-gray-600">
            <p>
              © {new Date().getFullYear()} The Reclaim Found - All Rights
              Reserved
            </p>
            <p className="mt-1">"Reporting on lost items since 2023"</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default NewspaperSection;