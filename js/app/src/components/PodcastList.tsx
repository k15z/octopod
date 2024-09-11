import React from 'react';
import { List, ListItem, ListItemText, Typography, IconButton, Box, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface Podcast {
  id: number;
  title: string;
  author: string;
  url: string;
  image: string;
}

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Up next
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {/* TODO: Calculate and display remaining time */}
          X:XX left
        </Typography>
      </Box>
      <List>
        {podcasts.map(podcast => (
          <ListItem
            key={podcast.id}
            sx={{
              mb: 1,
              bgcolor: 'background.paper', // Use the theme's paper color (#f3edf7)
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <Avatar src={podcast.image} alt={podcast.title} sx={{ mr: 2, width: 60, height: 60 }} />
            <ListItemText
              primary={podcast.title}
              secondary={podcast.author}
              primaryTypographyProps={{ fontWeight: 'bold' }}
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
