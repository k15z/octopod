import React from 'react';
import { Box, Typography, Button, IconButton, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

  // Placeholder data for statistics
  const stats = {
    amountPaid: 150.25,
    totalTips: 42,
    creatorsTipped: 15
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: 'text.primary',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Button variant="outlined" color="secondary" onClick={handleLogout} size="small">
            Logout
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
          <Avatar
            src="/placeholder-avatar.png" // Replace with actual user avatar when available
            alt="User Avatar"
            sx={{ width: 80, height: 80, mb: 2 }}
          />
          <Typography variant="body1" sx={{ mb: 1 }}>
            {userEmail}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            10 hours listened • 5 hours saved
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          mt: 4, 
          mb: 2,
          pl: 3, // Add left padding to align with the rest of the content
        }}>
          <Box sx={{ mr: '30px' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
              ${stats.amountPaid.toFixed(2)}
            </Typography>
            <Typography sx={{ fontSize: '11px', opacity: 0.6 }}>
              To Creators
            </Typography>
          </Box>
          <Box sx={{ mr: '30px' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
              {stats.totalTips}
            </Typography>
            <Typography sx={{ fontSize: '11px', opacity: 0.6 }}>
              Tips
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
              {stats.creatorsTipped}
            </Typography>
            <Typography sx={{ fontSize: '11px', opacity: 0.6 }}>
              Creators
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {podcasts[currentIndex] && (
        <Box sx={{ 
          width: '100%', 
          height: 140, 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0 
        }}>
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