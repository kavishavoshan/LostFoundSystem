import { useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import logo from '../../images/image.jpg'; // Make sure to import your logo

const NewspaperSection = () => {
  const [articles, setArticles] = useState([]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newArticle.image) {
      alert('Please upload an image');
      return;
    }

    setArticles(prev => [{
      ...newArticle,
      id: Date.now()
    }, ...prev]);

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
  };

  return (
    <div className="text-white bg-darkBlue min-h-screen">
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
        <nav
          className="flex items-center justify-between p-2 lg:px-5"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Lost and Found System</span>
              <img
                className="w-auto h-16 lg:h-20"
                src={logo}
                alt="Lost and Found System Logo"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-28">
            <a
              href="/"
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
             Features
            </a>
            <a
              href="/comunity"
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              Community
            </a>
            
            <a
              href="/news"
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              News
            </a>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <button
              onClick={() => (window.location.href = "/adminlogin")}
              className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-white hover:text-gray-900 transition"
            >
              Admin Login
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        {/* Newspaper Header */}
        <div className="max-w-6xl mx-auto">
          <header className="border-b-4 border-white mb-6 pb-4">
            <h1 className="text-5xl font-bold text-center mb-2 tracking-tight text-white">The Reclaim Found</h1>
            <div className="flex justify-between text-sm italic text-gray-300">
              <span>Vol. 1, No. 1</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span>Free Edition</span>
            </div>
          </header>

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
            
            {articles.length === 0 ? (
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
                      {article.imagePreview && (
                        <img 
                          src={article.imagePreview} 
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
          <footer className="mt-12 pt-4 border-t-4 border-white text-center text-sm italic text-gray-300">
            <p>© {new Date().getFullYear()} The Reclaim Found - All Rights Reserved</p>
            <p className="mt-1">"Reporting on lost items since 2023"</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default NewspaperSection;