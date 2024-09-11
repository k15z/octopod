import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import Header from "./Header";
import Player from "./Player";
import PodcastList from "./PodcastList";
import Footer from "./Footer";
import { playlist, playPodclip, skipPodclip } from "../api/services.gen";
import { Podclip } from "../api/types.gen";
import { Podcast } from "../types";
import { useAuth } from "../contexts/AuthContext";

const HomePage: React.FC = () => {
  const { userEmail, token } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await playlist({
        baseUrl: "http://localhost:18888/api",
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
            image:
              podclip.podcast.cover_url || "https://via.placeholder.com/150",
          })
        );
        setPodcasts(fetchedPodcasts);
        if (fetchedPodcasts.length > 0) {
          setCurrentPodcast(fetchedPodcasts[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPlaylist();
    }
  }, [token, fetchPlaylist]);

  const handleSelectPodcast = (podcast: Podcast) => {
    const index = podcasts.findIndex((p) => p.id === podcast.id);
    setCurrentPodcast(podcast);
    setCurrentPodcastIndex(index);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const markPodcastAsPlayed = async (podcast: Podcast) => {
    try {
      await playPodclip({
        baseUrl: "http://localhost:18888/api",
        path: {
          podclip_id: podcast.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking podcast as played:", error);
    }
  };

  const markPodcastAsSkipped = async (podcast: Podcast, skipTime: number) => {
    try {
      await skipPodclip({
        baseUrl: "http://localhost:18888/api",
        path: {
          podclip_id: podcast.id,
        },
        query: {
          skip_time: skipTime,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking podcast as skipped:", error);
    }
  };

  const handlePodcastEnded = async () => {
    if (currentPodcast) {
      await markPodcastAsPlayed(currentPodcast);
    }
    if (currentPodcastIndex < podcasts.length - 1) {
      const nextPodcast = podcasts[currentPodcastIndex + 1];
      setCurrentPodcast(nextPodcast);
      setCurrentPodcastIndex(currentPodcastIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNextPodcast = async (currentTime: number, duration: number) => {
    if (currentPodcast) {
      if (currentTime / duration > 0.6) {
        await markPodcastAsPlayed(currentPodcast);
      }
      await markPodcastAsSkipped(currentPodcast, currentTime);
    }
    if (currentPodcastIndex < podcasts.length - 1) {
      const nextPodcast = podcasts[currentPodcastIndex + 1];
      setCurrentPodcast(nextPodcast);
      setCurrentPodcastIndex(currentPodcastIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePreviousPodcast = () => {
    if (currentPodcastIndex > 0) {
      const previousPodcast = podcasts[currentPodcastIndex - 1];
      setCurrentPodcast(previousPodcast);
      setCurrentPodcastIndex(currentPodcastIndex - 1);
      setIsPlaying(true);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Header userEmail={userEmail} />
      {isLoading ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
              onEnded={handlePodcastEnded}
              onNext={handleNextPodcast}
              onPrevious={handlePreviousPodcast}
            />
          )}
        </>
      )}
      <Footer />
    </Box>
  );
};

export default HomePage;
