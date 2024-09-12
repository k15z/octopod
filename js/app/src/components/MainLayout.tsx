import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { playlist, playPodclip, skipPodclip } from "../api/services.gen";
import { Podclip } from "../api/types.gen";
import { Podcast } from "../types";
import { getApiBaseUrl } from "../utils/apiConfig";

interface PlayerContextType {
  podcasts: Podcast[];
  currentIndex: number;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangeIndex: (index: number) => Promise<void>;
  handlePodcastEnded: () => Promise<void>;
  handleProgressChange: (currentTime: number, duration: number) => void;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};

const MainLayout: React.FC = () => {
  const { token } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchPlaylist = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleChangeIndex = useCallback(
    async (index: number) => {
      console.log(`handleChangeIndex called with index: ${index}`); // Add this log
      const previousPodcast = podcasts[currentIndex];
      const nextPodcast = podcasts[index];

      if (index > currentIndex) {
        if (currentTime / duration > 0.6) {
          await markPodcastAsPlayed(previousPodcast);
        } else {
          await markPodcastAsSkipped(previousPodcast, currentTime);
        }
      }
      setCurrentIndex(index);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = nextPodcast.url;
        audioRef.current.play();
      }
    },
    [currentIndex, podcasts, currentTime, duration, markPodcastAsPlayed, markPodcastAsSkipped]
  );

  const handlePodcastEnded = useCallback(async () => {
    const currentPodcast = podcasts[currentIndex];
    await markPodcastAsPlayed(currentPodcast);

    if (currentIndex < podcasts.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = podcasts[currentIndex + 1].url;
        audioRef.current.play();
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, podcasts, markPodcastAsPlayed]);

  const handleProgressChange = useCallback(
    (newCurrentTime: number, newDuration: number) => {
      setCurrentTime(newCurrentTime);
      setDuration(newDuration);
    },
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => handlePodcastEnded();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handlePodcastEnded]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playerContextValue: PlayerContextType = {
    podcasts,
    currentIndex,
    isPlaying,
    setIsPlaying,
    handleChangeIndex,
    handlePodcastEnded,
    handleProgressChange,
    isLoading,
    currentTime,
    duration,
    audioRef,
  };

  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (location.pathname !== "/") return;

      if ((event.key === "ArrowUp" || event.key === "ArrowLeft") && currentIndex > 0) {
        handleChangeIndex(currentIndex - 1);
      } else if ((event.key === "ArrowDown" || event.key === "ArrowRight") && currentIndex < podcasts.length - 1) {
        handleChangeIndex(currentIndex + 1);
      } else if (event.code === "Space") {
        event.preventDefault();
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location.pathname, currentIndex, podcasts.length, handleChangeIndex]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PlayerContext.Provider value={playerContextValue}>
        <Outlet />
      </PlayerContext.Provider>
      <audio ref={audioRef} src={podcasts[currentIndex]?.url} />
    </Box>
  );
};

export default MainLayout;
