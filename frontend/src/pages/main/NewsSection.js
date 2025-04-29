import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import logo from '../../images/image.jpg';
import { createNewsArticle, getNewsArticles } from '../../api/newsApi'; // Adjust path as needed

const NewspaperSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArticle, setNewArticle] = useState({
    headline: '',
    content: '',
    image: null,
    imagePreview: '',
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch articles from backend on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getNewsArticles();
        // Map backend data to frontend format if needed
        setArticles(
          data.map(article => ({
            id: article.id,
            headline: article.headline,
            content: article.story,
            imageUrl: article.imageUrl, // Adjust if your backend returns image URL differently
            date: article.date || new Date().toLocaleDateString(),
          }))
        );
      } catch (error) {
        alert('Failed to load articles');
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
        setNewArticle(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewArticle(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newArticle.image) {
      alert('Please upload an image');
      return;
    }
    if (!newArticle.headline || !newArticle.content) {
      alert('Headline and story are required');
      return;
    }
    try {
      // Submit to backend
      const created = await createNewsArticle({
        headline: newArticle.headline,
        story: newArticle.content,
        image: newArticle.image,
      });
      // Add to articles list (optimistically or refetch)
      setArticles(prev => [{
        id: created.id,
        headline: created.headline,
        content: created.story,
        imageUrl: created.imageUrl, // Adjust based on backend response
        date: created.date || new Date().toLocaleDateString(),
      }, ...prev]);
      // Reset form
      setNewArticle({
        headline: '',
        content: '',
        image: null,
        imagePreview: '',
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    } catch (error) {
      alert('Failed to publish article');
    }
  };

  return (
    <div className="text-white bg-darkBlue min-h-screen">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-darkBlue bg-opacity-90 backdrop-blur-sm">
        {/* ... header code unchanged ... */}
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Newspaper Header */}
          {/* ... header code unchanged ... */}

          {/* Upload Section */}
          <div className="bg-gray-800 p-6 mb-8 shadow-lg border border-gray-600 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2 text-white">Submit Your News</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-lg mb-2 text-white">Headline</label>
                <input
                  type="text"
                  value={newArticle.headline}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full p-2 border-b-2 border-white bg-transparent focus:outline-none text-xl text-white"
                  placeholder="Enter headline..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg mb-2 text-white">Story</label>
                <textarea
                  value={newArticle.content}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border-b-2 border-white bg-transparent focus:outline-none text-white"
                  rows="4"
                  placeholder="Write your story here..."
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-lg mb-2 text-white">Featured Image</label>
                {!newArticle.imagePreview ? (
                  <div className="border-2 border-dashed border-gray-500 p-8 text-center rounded-lg">
                    <label className="cursor-pointer">
                      <FiImage className="mx-auto text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-400">Click to upload image</p>
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
                      className="w-full h-64 object-cover border border-gray-500 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-white text-gray-900 px-6 py-3 text-lg font-semibold hover:bg-gray-200 transition rounded-lg"
              >
                Publish Article
              </button>
            </form>
          </div>

          {/* Newspaper Articles */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold border-b-2 border-white pb-2 text-white">Latest News</h2>
            {loading ? (
              <div className="text-center py-12 italic text-gray-400">
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 italic text-gray-400">
                No articles yet. Be the first to publish!
              </div>
            ) : (
              articles.map(article => (
                <article key={article.id} className="mb-8 pb-8 border-b border-gray-600 last:border-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-3xl font-bold mb-2 leading-tight text-white">{article.headline}</h3>
                      <p className="text-sm italic mb-4 text-gray-300">Published on {article.date}</p>
                      <p className="text-lg leading-relaxed text-gray-300">
                        {article.content || "No content provided. An image tells a thousand words!"}
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      {article.imageUrl && (
                        <img 
                          src={article.imageUrl} 
                          alt="Article visual" 
                          className="w-full h-64 object-cover border border-gray-600 shadow-md rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Newspaper Footer */}
          {/* ... footer code unchanged ... */}
        </div>
      </main>
    </div>
  );
};

export default NewspaperSection;
