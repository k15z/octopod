import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Avatar, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePlayerContext } from './MainLayout';
import PodcastCard from './PodcastCard';
import { btcPrice, userStatistics, userProfile } from '../api/services.gen';
import { getApiBaseUrl } from '../utils/apiConfig';

interface UserStats {
  amountPaid: number;
  totalTips: number;
  creatorsTipped: number;
  hoursListened: number;
  hoursSaved: number;
}

interface UserProfileInfo {
  email: string;
  fullName: string;
  imageUrl: string | null;
  // Add any other fields that are returned by the userProfile function
}

const ProfileSettings: React.FC = () => {
  const { userEmail, logout, token } = useAuth();
  const navigate = useNavigate();
  const { podcasts, currentIndex, isPlaying, setIsPlaying, handleProgressChange } = usePlayerContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [usdConversionRate, setUsdConversionRate] = useState<number | null>(null);
  const [areStatsLoading, setAreStatsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [userProfileInfo, setUserProfileInfo] = useState<UserProfileInfo | null>(null);
  const isLoading = isProfileLoading || areStatsLoading;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        setIsProfileLoading(true);
        const response = await userProfile({
          baseUrl: getApiBaseUrl(),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          const userData: UserProfileInfo = {
            email: response.data.email,
            fullName: response.data.first_name + " " + response.data.last_name,
            imageUrl: response.data.picture_url,
          };
          setUserProfileInfo(userData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    const fetchUsdConversionRate = async () => {
      try {
        const response = await btcPrice({
          baseUrl: getApiBaseUrl(),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          setUsdConversionRate(response.data.USD);
        }
      } catch (error) {
        console.error("Error fetching USD conversion rate:", error);
      }
    };

    fetchUsdConversionRate();
  }, [token]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!token || !usdConversionRate) return;
      try {
        setAreStatsLoading(true);
        const response = await userStatistics({
          baseUrl: getApiBaseUrl(),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          setStats({
            amountPaid: satsToUsd(response.data.lifetime_spend, usdConversionRate),
            totalTips: response.data.num_tips,
            creatorsTipped: response.data.creator_amounts.length,
            hoursListened: response.data.seconds_listened / 3600,
            hoursSaved: response.data.seconds_saved / 3600,
          });
        }
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      } finally {
        setAreStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [token, usdConversionRate]);

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
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 6 }}>
              <Avatar
                src={userProfileInfo?.imageUrl || "/placeholder-avatar.png"}
                alt="User Avatar"
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <Typography variant="h4" sx={{ mb: 1 }}>
                {userProfileInfo?.fullName ?? userEmail}
              </Typography>
              {stats && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="img"
                    src="/headphones.svg"
                    alt="Headphones Icon"
                    sx={{
                      width: 20,
                      height: 20,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {stats.hoursListened.toFixed(1)} hours
                  </Typography>
                  <Box
                    component="img"
                    src="/smartwatch.svg"
                    alt="Smartwatch Icon"
                    sx={{
                      width: 20,
                      height: 20,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stats.hoursSaved.toFixed(1)} hours saved
                  </Typography>
                </Box>
              )}
            </Box>

            {stats && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                mt: 4, 
                mb: 2
              }}>
                <Box sx={{ mr: '30px' }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                    ${stats.amountPaid.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontSize: '15px', opacity: 0.6 }}>
                    To Creators
                  </Typography>
                </Box>
                <Box sx={{ mr: '30px' }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                    {stats.totalTips}
                  </Typography>
                  <Typography sx={{ fontSize: '15px', opacity: 0.6 }}>
                    Tips
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                    {stats.creatorsTipped}
                  </Typography>
                  <Typography sx={{ fontSize: '15px', opacity: 0.6 }}>
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

const satsToUsd = (sats: number, conversionRate: number) => {
    return sats * conversionRate / 100000000;
}

export default ProfileSettings;