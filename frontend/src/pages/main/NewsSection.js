import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import { createNewsArticle, getNewsArticles } from '../../api/newsApi';

const NewspaperSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getNewsArticles();
        setArticles(
          data.map(article => ({
            id: article.id,
            headline: article.headline,
            content: article.story,
            // Map backend image path to full URL if needed
            imageUrl: article.imagePath
              ? `http://localhost:3001${article.imagePath}`
              : null,
            date: article.createdAt
              ? new Date(article.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }))
        );
      } catch {
        alert('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline || !content) {
      alert('Headline and story are required');
      return;
    }
    if (!image) {
      alert('Please upload an image');
      return;
    }
    try {
      const created = await createNewsArticle({
        headline,
        story: content,
        image,
      });
      setArticles(prev => [
        {
          id: created.id,
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
      setHeadline('');
      setContent('');
      removeImage();
    } catch {
      alert('Failed to publish article');
    }
  };

  return (
    <div className="text-white bg-darkBlue min-h-screen">
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          <section className="bg-gray-800 p-6 mb-8 shadow-lg border border-gray-600 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2">Submit Your News</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-lg mb-2">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full p-2 border-b-2 border-white bg-transparent focus:outline-none text-xl"
                  placeholder="Enter headline..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg mb-2">Story</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2 border-b-2 border-white bg-transparent focus:outline-none"
                  rows="4"
                  placeholder="Write your story here..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-lg mb-2">Featured Image</label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-500 p-8 text-center rounded-lg">
                    <label className="cursor-pointer">
                      <FiImage className="mx-auto text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-400">Click to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
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
          </section>

          {/* Newspaper Articles */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold border-b-2 border-white pb-2">Latest News</h2>
            {loading ? (
              <div className="text-center py-12 italic text-gray-400">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 italic text-gray-400">
                No articles yet. Be the first to publish!
              </div>
            ) : (
              articles.map(article => (
                <article key={article.id} className="mb-8 pb-8 border-b border-gray-600 last:border-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-3xl font-bold mb-2 leading-tight">{article.headline}</h3>
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default NewspaperSection;
