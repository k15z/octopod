import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Slider,
} from "@mui/material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import SkipPreviousRounded from "@mui/icons-material/SkipPreviousRounded";
import SkipNextRounded from "@mui/icons-material/SkipNextRounded";
import { Podcast } from "../types";

interface PlayerProps {
  podcast: Podcast | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onEnded: () => void;
  onNext: (currentTime: number, duration: number) => void;
  onPrevious: () => void;
}

const Player: React.FC<PlayerProps> = ({
  podcast,
  isPlaying,
  onTogglePlay,
  onEnded,
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (podcast && audioRef.current) {
      if (audioRef.current.src !== podcast.url) {
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => onEnded();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  if (!podcast) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === "number") {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: "-14px",
          left: 0,
          right: 0,
          height: "8px",
          bgcolor: "transparent",
          zIndex: 1,
        }}
      >
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleSeek}
          sx={{
            color: "#1DB954",
            height: 4,
            padding: 0,
            "& .MuiSlider-thumb": {
              width: 8,
              height: 8,
              transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0px 0px 0px 8px rgb(29 185 84 / 16%)",
              },
              "&.Mui-active": {
                width: 12,
                height: 12,
              },
            },
            "& .MuiSlider-rail": {
              opacity: 0.28,
            },
          }}
        />
      </Box>
      <Card
        sx={{
          borderRadius: 0,
          bgcolor: "#282828",
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <CardContent sx={{ p: 1, pt: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0,
              mt: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CardMedia
              component="img"
              sx={{ width: 48, height: 48, borderRadius: 1, mr: 2 }}
              image={podcast?.image}
              alt={podcast?.title}
            />
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <Typography variant="subtitle2" color="text.primary" noWrap>
                {podcast?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {podcast?.author}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton sx={{ color: "text.primary" }} onClick={onPrevious}>
                <SkipPreviousRounded />
              </IconButton>
              <IconButton
                onClick={onTogglePlay}
                sx={{
                  mx: 1,
                  color: "text.primary",
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
              </IconButton>
              <IconButton sx={{ color: "text.primary" }} onClick={() => onNext(currentTime, duration)}>
                <SkipNextRounded />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
        <audio ref={audioRef} />
      </Card>
    </Box>
  );
};

export default Player;
