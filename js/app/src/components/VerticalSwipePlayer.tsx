import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { playlist, playPodclip, skipPodclip } from "../api/services.gen";
import { Podclip } from "../api/types.gen";
import { Podcast } from "../types";
import SwipeableViews from "react-swipeable-views";
import PodcastCard from "./PodcastCard";
import { getApiBaseUrl } from "../utils/apiConfig";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const VerticalSwipePlayer: React.FC = () => {
  const { token } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchPlaylist = useCallback(async () => {
    if (!token) return;
    try {
      const response = await playlist({
        baseUrl: getApiBaseUrl(),
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
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const markPodcastAsPlayed = useCallback(
    async (podcast: Podcast) => {
      if (!token) return;
      try {
        await playPodclip({
          baseUrl: getApiBaseUrl(),
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
    },
    [token]
  );

  const markPodcastAsSkipped = useCallback(
    async (podcast: Podcast, skipTime: number) => {
      if (!token) return;
      try {
        await skipPodclip({
          baseUrl: getApiBaseUrl(),
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
    },
    [token]
  );

  const handlePodcastEnded = useCallback(async () => {
    const currentPodcast = podcasts[currentIndex];
    await markPodcastAsPlayed(currentPodcast);

    if (currentIndex < podcasts.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, podcasts, markPodcastAsPlayed]);

  const handleChangeIndex = useCallback(
    async (index: number) => {
      const previousPodcast = podcasts[currentIndex];

      if (index > currentIndex) {
        if (currentTime / duration > 0.6) {
          await markPodcastAsPlayed(previousPodcast);
        } else {
          await markPodcastAsSkipped(previousPodcast, currentTime);
        }
      }

      setCurrentIndex(index);
      setIsPlaying(true);
    },
    [
      currentIndex,
      podcasts,
      markPodcastAsPlayed,
      markPodcastAsSkipped,
      currentTime,
      duration,
    ]
  );

  const handleProgressChange = useCallback(
    (newCurrentTime: number, newDuration: number) => {
      setCurrentTime(newCurrentTime);
      setDuration(newDuration);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
        currentIndex > 0
      ) {
        handleChangeIndex(currentIndex - 1);
      } else if (
        (event.key === "ArrowDown" || event.key === "ArrowRight") &&
        currentIndex < podcasts.length - 1
      ) {
        handleChangeIndex(currentIndex + 1);
      } else if (event.code === "Space") {
        event.preventDefault(); // Prevent scrolling
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
      }
    },
    [currentIndex, podcasts.length, handleChangeIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 1000,
        }}
      >
        <Box sx={{ width: 40 }} /> {/* Placeholder for balance */}
        <Box component="img" src="/octopod_logo.svg" alt="Octopod Logo" />
        <IconButton
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Box>
      <SwipeableViews
        axis="y"
        index={currentIndex}
        onChangeIndex={handleChangeIndex}
        enableMouseEvents
        containerStyle={{ height: "100%" }}
        style={{ height: "100%" }}
        slideStyle={{ height: "100%" }}
      >
        {podcasts.map((podcast, index) => (
          <Box key={podcast.id} sx={{ height: "100vh", overflow: "hidden" }}>
            <PodcastCard
              podcast={podcast}
              isActive={index === currentIndex}
              isPlaying={isPlaying && index === currentIndex}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onEnded={handlePodcastEnded}
              onProgressChange={handleProgressChange}
            />
          </Box>
        ))}
      </SwipeableViews>
    </Box>
  );
};

export default VerticalSwipePlayer;
