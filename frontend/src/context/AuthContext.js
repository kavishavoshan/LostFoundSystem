import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [token, setToken] = useState(localStorage.getItem('token')); // Initialize token state

  // Set axios default authorization header whenever token changes
  useEffect(() => {
    console.log(`[AuthContext] Token state changed: ${token ? 'Token exists' : 'No token'}`);
    
    if (token) {
      console.log(`[AuthContext] Setting axios default header with token: ${token.substring(0, 10)}...`);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      console.log('[AuthContext] Clearing axios default header - no token');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    console.log('[AuthContext] Initial useEffect triggered.');
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    // Log the exact value retrieved
    console.log(`[AuthContext] useEffect: Retrieved token from localStorage: '${storedToken}' (Type: ${typeof storedToken})`);

    // Check if token exists AND is not the literal string "undefined"
    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') { // Added check for 'null'
      setToken(storedToken); // Update state if necessary (though already initialized)
      setIsAuthenticated(true); // Set isAuthenticated to true immediately
      checkAuth(storedToken); // Pass the validated token
    } else {
      // If token is null, empty string, or the literal string "undefined" or "null"
      if (storedToken === 'undefined' || storedToken === 'null') {
          console.log('[AuthContext] Found literal string "undefined" or "null" in localStorage, removing it.');
          localStorage.removeItem('token'); // Clean up bad token
      }
      console.log('[AuthContext] No valid token found, setting loading false.');
      setLoading(false);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
    // Intentionally empty dependency array to run only once on mount
  }, []);

  const checkAuth = async (tokenToCheck) => { // Accept token as argument
    console.log('[AuthContext] checkAuth called.');
    setLoading(true); // Ensure loading is true while checking
    // Use the passed token for the check, fallback to localStorage shouldn't be needed here if useEffect logic is correct
    const tokenForRequest = tokenToCheck || localStorage.getItem('token'); 
    console.log(`[AuthContext] checkAuth: Using token for request: '${tokenForRequest ? tokenForRequest.substring(0, 10) + '...' : 'None'}'`);
    console.log('[AuthContext] checkAuth: Current Axios default header (before request):', axios.defaults.headers.common['Authorization']);
    try {
      // Send the request with the specific token for this check
      const response = await axios.get('http://localhost:3001/auth/me', {
        headers: { Authorization: `Bearer ${tokenForRequest}` }
      });
      console.log('[AuthContext] /auth/me response:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      console.log('[AuthContext] checkAuth success: isAuthenticated=true');
    } catch (error) {
      console.error('[AuthContext] /auth/me error:', error.response ? error.response.data : error.message);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setToken(null); // Clear token state as well
      console.log('[AuthContext] checkAuth failed: isAuthenticated=false, token removed.');
    } finally {
      setLoading(false);
      console.log('[AuthContext] checkAuth finished: loading=false');
    }
  };

  const login = async (email, password) => {
    console.log('[AuthContext] login called.');
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });
      
      // Handle both token formats (accessToken from backend or token from legacy code)
      const newToken = response.data.accessToken || response.data.token;
      console.log(`[AuthContext] Login response received: token='${newToken}' (Type: ${typeof newToken})`);
      
      if (newToken && typeof newToken === 'string') {
        console.log('[AuthContext] Login success: Valid token received.');
        localStorage.setItem('token', newToken);
        setToken(newToken); // Set token state FIRST
        
        // If user data is not included in response, fetch it
        if (!response.data.user) {
          console.log('[AuthContext] User data not included in login response, fetching from /auth/me');
          await checkAuth(newToken);
        } else {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } else {
        console.error('[AuthContext] Login failed: Invalid or missing token received from backend.');
        // Clear any potentially invalid token/state
        localStorage.removeItem('token');
        setToken(null);
        throw new Error('Login failed: Invalid token received.'); // Propagate error
      }
      
      setLoading(false); // Set loading false last
      return true;
    } catch (error) {
      console.error('[AuthContext] Login error:', error.response ? error.response.data : error.message);
      // Clear state on login failure
      localStorage.removeItem('token');
      setToken(null); // Clear token state on error
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('[AuthContext] register called.');
    try {
      const response = await axios.post('http://localhost:3001/auth/register', userData);
      const newToken = response.data.accessToken || response.data.token;
      console.log(`[AuthContext] Register response received: token='${newToken}' (Type: ${typeof newToken})`);
      if (newToken && typeof newToken === 'string') {
        console.log('[AuthContext] Register success: Valid token received.');
        localStorage.setItem('token', newToken);
        setToken(newToken); // Set token state FIRST
      } else {
        console.error('[AuthContext] Register failed: Invalid or missing token received from backend.');
        // Clear any potentially invalid token/state
        localStorage.removeItem('token');
        setToken(null);
        throw new Error('Registration failed: Invalid token received.'); // Propagate error
      }
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false); // Set loading false last
      return true;
    } catch (error) {
      console.error('[AuthContext] Register error:', error.response ? error.response.data : error.message);
      // Clear state on register failure
      localStorage.removeItem('token');
      setToken(null); // Clear token state on error
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthContext] logout called.');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false); // Ensure loading is false after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, token, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Expose loading state as well
  return { ...context }; // Return all values including loading and token
};
