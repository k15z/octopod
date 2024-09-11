import React, { useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Card, CardContent, CardMedia } from '@mui/material';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import { Podcast } from '../types';

interface PlayerProps {
  podcast: Podcast | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const Player: React.FC<PlayerProps> = ({ podcast, isPlaying, onTogglePlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (podcast) {
      if (audioRef.current) {
        audioRef.current.src = podcast.url;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [podcast, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!podcast) return null;

  return (
    <Card sx={{ 
      borderRadius: 0,
      bgcolor: '#282828', // Dark grey background
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
    }}>
      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <CardMedia
          component="img"
          sx={{ width: 56, height: 56, borderRadius: 1, mr: 2 }}
          image={podcast.image}
          alt={podcast.title}
        />
        <Box sx={{ flexGrow: 1, mr: 2 }}>
          <Typography variant="subtitle1" color="text.primary" noWrap>{podcast.title}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{podcast.author}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ color: 'text.primary' }}>
            <SkipPreviousRounded />
          </IconButton>
          <IconButton 
            onClick={onTogglePlay} 
            sx={{ 
              mx: 1,
              color: 'text.primary',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </IconButton>
          <IconButton sx={{ color: 'text.primary' }}>
            <SkipNextRounded />
          </IconButton>
        </Box>
      </CardContent>
      <audio ref={audioRef} />
    </Card>
  );
};

export default Player;
