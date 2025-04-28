import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects from /messaging to /messages
const MessagingRedirect = () => {
  useEffect(() => {
    console.log('Redirecting from /messaging to /messages');
  }, []);

  return <Navigate to="/messages" replace />;
};

export default MessagingRedirect;