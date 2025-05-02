import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/news-pages';

// Reuse your existing auth token functions
const getAuthToken = () => localStorage.getItem("token");

// Configure axios instance
const newsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`
  }
});

// Add request interceptor
newsApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const createNewsArticle = async (articleData) => {
  try {
    const formData = new FormData();
    formData.append('headline', articleData.headline);
    formData.append('story', articleData.story);
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    const response = await newsApi.post('', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Article creation failed", error);
    throw error;
  }
};

export const getNewsArticles = async () => {
  try {
    const response = await newsApi.get('');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch articles", error);
    throw error;
  }
};

export const publishArticle = async (id) => {
  try {
    const response = await newsApi.post(`/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error("Publishing failed", error);
    throw error;
  }
};