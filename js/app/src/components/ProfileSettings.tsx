import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from './MainLayout';
import PodcastCard from './PodcastCard';

const ProfileSettings: React.FC = () => {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const { podcasts, currentIndex, isPlaying, setIsPlaying, handleProgressChange } = usePlayerContext();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" paragraph>
        Email: {userEmail}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
        Back to Player
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ ml: 2 }}>
        Logout
      </Button>
      {podcasts[currentIndex] && (
        <Box sx={{ mt: 4, height: 200 }}>
          <PodcastCard
            podcast={podcasts[currentIndex]}
            isActive={true}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onProgressChange={handleProgressChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProfileSettings;