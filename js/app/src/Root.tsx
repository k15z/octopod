import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const Root: React.FC = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default Root;