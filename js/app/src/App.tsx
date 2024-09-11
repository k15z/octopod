import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import Player from './components/Player';
import PodcastList from './components/PodcastList';
import Footer from './components/Footer';

interface Podcast {
  id: number;
  title: string;
  author: string;
  url: string;
  image: string;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF5722', // Orange color for the player
    },
    background: {
      default: '#ffffff', // Main app background (white)
      paper: '#f3edf7', // Background for podcast list items and footer
    },
    action: {
      active: '#FF5722', // Orange color for active icons
    },
  },
});

const App: React.FC = () => {
  // Base64-encoded audio samples (very short beep sounds)
  const audioSample1 = `data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A${"//".repeat(8192)}AA==`;
  const audioSample2 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT1/////+/v7//f39//z8/P/7+/v/+vr6//n5+f/4+Pj/9/f3//b29v/19fX/9PT0//Pz8//y8vL/8fHx//Dw8P8=";
  const audioSample3 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAD//////v7+//39/f/8/Pz/+/v7//r6+v/5+fn/+Pj4//f39//29vb/9fX1//T09P/z8/P/8vLy//Hx8f8=";

  const podcasts: Podcast[] = [
    {
      id: 1,
      title: "Audio Sample 1",
      author: "Test Author",
      url: audioSample1,
      image: "https://via.placeholder.com/150"
    },
    {
      id: 2,
      title: "Audio Sample 2",
      author: "Test Author",
      url: audioSample2,
      image: "https://via.placeholder.com/150"
    },
    {
      id: 3,
      title: "Audio Sample 3",
      author: "Test Author",
      url: audioSample3,
      image: "https://via.placeholder.com/150"
    },
  ];

  // Initialize currentPodcast with the first podcast in the list
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(podcasts[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectPodcast = (podcast: Podcast) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <Header />
        <Player 
          podcast={currentPodcast} 
          isPlaying={isPlaying} 
          onTogglePlay={handleTogglePlay}
        />
        <PodcastList 
          podcasts={podcasts}
          currentPodcast={currentPodcast}
          isPlaying={isPlaying}
          onSelectPodcast={handleSelectPodcast}
          onTogglePlay={handleTogglePlay}
        />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default App;
