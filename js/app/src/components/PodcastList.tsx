import React from 'react';
import { List, ListItem, ListItemText, Typography, IconButton, Box, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Podcast } from '../types';

interface PodcastListProps {
  podcasts: Podcast[];
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  onSelectPodcast: (podcast: Podcast) => void;
  onTogglePlay: () => void;
}

const PodcastList: React.FC<PodcastListProps> = ({ 
  podcasts, 
  currentPodcast, 
  isPlaying, 
  onSelectPodcast, 
  onTogglePlay 
}) => {
  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'text.primary' }}>
        Podcasts
      </Typography>
      <List>
        {podcasts.map((podcast, index) => (
          <ListItem
            key={podcast.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: 'text.secondary', mr: 2, width: 20 }}>
              {index + 1}
            </Typography>
            <Avatar src={podcast.image} alt={podcast.title} sx={{ mr: 2, width: 40, height: 40 }} />
            <ListItemText
              primary={podcast.title}
              secondary={podcast.author}
              primaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
            <IconButton 
              edge="end" 
              aria-label="play" 
              onClick={() => {
                if (currentPodcast?.id !== podcast.id) {
                  onSelectPodcast(podcast);
                } else {
                  onTogglePlay();
                }
              }}
              sx={{ color: 'primary.main' }}
            >
              {currentPodcast?.id === podcast.id && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PodcastList;
