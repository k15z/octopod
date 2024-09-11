import React, { useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Card, CardContent, CardMedia } from '@mui/material';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';

interface Podcast {
  id: number;
  title: string;
  author: string;
  url: string;
  image: string;
}

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
      m: 2, 
      borderRadius: 2,
      boxShadow: 3,
      bgcolor: '#f39a73', // Player background color
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CardMedia
            component="img"
            sx={{ width: 80, height: 80, borderRadius: 2, mr: 2 }}
            image={podcast.image}
            alt={podcast.title}
          />
          <Box>
            <Typography variant="h6" noWrap color="text.primary">{podcast.title}</Typography>
            <Typography variant="subtitle1" noWrap color="text.secondary">{podcast.author}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton 
            sx={{ 
                mx: 1,
                width: 56,
                height: 56,
                backgroundColor: '#f0f0f0', // Light grey background
                '&:hover': {
                  backgroundColor: '#e0e0e0', // Slightly darker on hover
                },
                boxShadow: 3,
                '&:active': {
                  boxShadow: 6,
                },
            }}
          >
            <SkipPreviousRounded sx={{ fontSize: 38, color: '#757575' }} />
          </IconButton>
          <IconButton 
            onClick={onTogglePlay} 
            sx={{ 
                mx: 1,
                width: 56,
                height: 56,
                backgroundColor: '#f0f0f0', // Light grey background
                '&:hover': {
                  backgroundColor: '#e0e0e0', // Slightly darker on hover
                },
                boxShadow: 3,
                '&:active': {
                  boxShadow: 6,
                },
            }}
          >
            {isPlaying ? 
              <PauseRounded sx={{ fontSize: 38, color: '#757575' }} /> : 
              <PlayArrowRounded sx={{ fontSize: 38, color: '#757575' }} />
            }
          </IconButton>
          <IconButton
            sx={{
              mx: 1,
              width: 56,
              height: 56,
              backgroundColor: '#f0f0f0', // Light grey background
              '&:hover': {
                backgroundColor: '#e0e0e0', // Slightly darker on hover
              },
              boxShadow: 3,
              '&:active': {
                boxShadow: 6,
              },
            }}
          >
            <SkipNextRounded sx={{ fontSize: 38, color: '#757575' }} />
          </IconButton>
        </Box>
      </CardContent>
      <audio ref={audioRef} />
    </Card>
  );
};

export default Player;
