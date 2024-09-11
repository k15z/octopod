import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  LinearProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Podcast } from "../types";
import { keyframes } from "@mui/system";

interface PodcastCardProps {
  podcast: Podcast;
  isActive: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onEnded: () => void;
  onProgressChange: (currentTime: number, duration: number) => void;
}

const getRandomGradient = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F67280",
    "#C06C84",
    "#6C5B7B",
    "#355C7D",
    "#F8B195",
  ];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const scrollAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(calc(-100% + 300px)); }
`;

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  isActive,
  isPlaying,
  onTogglePlay,
  onEnded,
  onProgressChange
}) => {
  const [progress, setProgress] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [gradient] = useState(getRandomGradient());

  useEffect(() => {
    if (isActive && isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isActive, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const duration = audio.duration;
      const currentTime = audio.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
        if (isActive) {
          onProgressChange(currentTime, duration);
        }
      }
    };

    const handleEnded = () => {
      onEnded();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isActive, onEnded, onProgressChange]);

  useEffect(() => {
    if (titleRef.current) {
      const isOverflowing = titleRef.current.scrollWidth > titleRef.current.clientWidth;
      setShouldAnimate(isOverflowing);
    }
  }, [podcast.title]);

  return (
    <Box
      onClick={onTogglePlay}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        background: `${gradient}, linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)`,
        backgroundBlendMode: "overlay",
        cursor: "pointer",
        position: "relative",
        padding: 3,
      }}
    >
      {!isPlaying && (
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 60, color: "white" }} />
        </IconButton>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: "100%",
          maxWidth: 600,
          pt: 2,
          pb: 2,
        }}
      >
        <Avatar
          src={podcast.image}
          alt={podcast.title}
          sx={{ width: 50, height: 50, marginRight: 1, flexShrink: 0 }}
        />
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Box
            ref={titleRef}
            sx={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="subtitle1"
              color="white"
              sx={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                ...(shouldAnimate && {
                  animation: `${scrollAnimation} 10s linear infinite`,
                  "&:hover": {
                    animationPlayState: "paused",
                  },
                }),
              }}
            >
              {podcast.title}
            </Typography>
          </Box>
          <Typography variant="body2" color="white" sx={{ fontSize: '0.8rem' }}>
            {podcast.author}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: "100%",
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "white",
            },
          }}
        />
      </Box>
      <audio ref={audioRef} src={podcast.url} />
    </Box>
  );
};

export default PodcastCard;
