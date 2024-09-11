import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { playlist } from '../api/services.gen';
import { Podclip } from '../api/types.gen';
import { Podcast } from '../types';
import SwipeableViews from 'react-swipeable-views';
import PodcastCard from './PodcastCard';

const VerticalSwipePlayer: React.FC = () => {
  const { token } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchPlaylist = useCallback(async () => {
    try {
      const response = await playlist({
        baseUrl: 'http://localhost:18888/api',
        query: {
          seconds: 60 * 30,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        const fetchedPodcasts: Podcast[] = response.data.results.map(
          (podclip: Podclip) => ({
            id: podclip.id,
            title: podclip.title,
            author: podclip.podcast.creator_name,
            url: podclip.audio_url,
            image: podclip.podcast.cover_url || 'https://via.placeholder.com/150',
          })
        );
        setPodcasts(fetchedPodcasts);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPlaylist();
    }
  }, [token, fetchPlaylist]);

  const handleChangeIndex = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowUp' && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      setIsPlaying(true);
    } else if (event.key === 'ArrowDown' && currentIndex < podcasts.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      setIsPlaying(true);
    } else if (event.code === 'Space') {
      event.preventDefault(); // Prevent scrolling
      setIsPlaying(prevIsPlaying => !prevIsPlaying);
    }
  }, [currentIndex, podcasts.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <SwipeableViews
        axis="y"
        index={currentIndex}
        onChangeIndex={handleChangeIndex}
        enableMouseEvents
        containerStyle={{ height: '100%' }}
        style={{ height: '100%' }}
        slideStyle={{ height: '100%' }}
      >
        {podcasts.map((podcast, index) => (
          <Box key={podcast.id} sx={{ height: '100vh', overflow: 'hidden' }}>
            <PodcastCard
              podcast={podcast}
              isActive={index === currentIndex}
              isPlaying={isPlaying && index === currentIndex}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          </Box>
        ))}
      </SwipeableViews>
    </Box>
  );
};

export default VerticalSwipePlayer;