import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Avatar, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from './MainLayout';
import PodcastCard from './PodcastCard';
import { userStatistics } from '../api/services.gen';
import { getApiBaseUrl } from '../utils/apiConfig';

interface UserStats {
  amountPaid: number;
  totalTips: number;
  creatorsTipped: number;
  hoursListened: number;
  hoursSaved: number;
}

const ProfileSettings: React.FC = () => {
  const { userEmail, logout, token } = useAuth();
  const navigate = useNavigate();
  const { podcasts, currentIndex, isPlaying, setIsPlaying, handleProgressChange } = usePlayerContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!token) return;
      try {
        const response = await userStatistics({
          baseUrl: getApiBaseUrl(),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          setStats({
            amountPaid: response.data.lifetime_spend,
            totalTips: response.data.num_tips,
            creatorsTipped: response.data.creator_amounts.length,
            hoursListened: response.data.seconds_listened / 3600,
            hoursSaved: response.data.seconds_saved / 3600,
          });
        }
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
              <Avatar
                src="/placeholder-avatar.png" // Replace with actual user avatar when available
                alt="User Avatar"
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <Typography variant="body1" sx={{ mb: 1 }}>
                {userEmail}
              </Typography>
              {stats && (
                <Typography variant="caption" color="text.secondary">
                  {stats.hoursListened.toFixed(1)} hours listened • {stats.hoursSaved.toFixed(1)} hours saved
                </Typography>
              )}
            </Box>

            {stats && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                mt: 4, 
                mb: 2,
                pl: 3,
              }}>
                <Box sx={{ mr: '30px' }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
                    {Math.round(stats.amountPaid)} SATs
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
            )}
          </>
        )}
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