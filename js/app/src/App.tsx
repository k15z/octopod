import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import Header from './components/Header';
import Player from './components/Player';
import PodcastList from './components/PodcastList';
import Footer from './components/Footer';
import { listPodcasts } from './api/services.gen';
import { Podcast as APIPodcast } from './api/types.gen';
import { Podcast } from './types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954', // Spotify green
    },
    background: {
      default: '#121212', // Dark background
      paper: '#181818', // Slightly lighter background for components
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography: {
    fontFamily: '"Circular", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      try {
        const response = await listPodcasts({
          // TODO: Replace with env configuration based on dev/prod.
          baseUrl: 'http://localhost:18888/api',
        });
        if (response.data) {
          const fetchedPodcasts: Podcast[] = response.data.results.map((apiPodcast: APIPodcast) => ({
            id: apiPodcast.id,
            title: apiPodcast.title,
            author: apiPodcast.creator_name,
            url: apiPodcast.audio_url || '',
            image: apiPodcast.cover_url || 'https://via.placeholder.com/150'
          }));
          setPodcasts(fetchedPodcasts);
          if (fetchedPodcasts.length > 0) {
            setCurrentPodcast(fetchedPodcasts[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

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
        {isLoading ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <PodcastList 
              podcasts={podcasts}
              currentPodcast={currentPodcast}
              isPlaying={isPlaying}
              onSelectPodcast={handleSelectPodcast}
              onTogglePlay={handleTogglePlay}
            />
            {currentPodcast && (
              <Player 
                podcast={currentPodcast} 
                isPlaying={isPlaying} 
                onTogglePlay={handleTogglePlay}
              />
            )}
          </>
        )}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default App;
