import React, { useEffect } from 'react';

/**
 * This component automatically sets up the test environment for messaging
 * It runs when the Messaging component is loaded and ensures the userId
 * is set in localStorage to bypass authentication
 */
const TestEnvironmentLoader = ({ userId = '1' }) => {
  useEffect(() => {
    // Check if we're already in test mode
    const existingUserId = localStorage.getItem('userId');
    
    if (!existingUserId) {
      console.log('[TestEnvironmentLoader] Setting up test environment with userId:', userId);
      localStorage.setItem('userId', userId);
      
      // Force a re-render of the component to trigger the PrivateRoute bypass
      window.location.reload();
    } else {
      console.log('[TestEnvironmentLoader] Test environment already set up with userId:', existingUserId);
    }
  }, [userId]);

  return null; // This component doesn't render anything
};

export default TestEnvironmentLoader;