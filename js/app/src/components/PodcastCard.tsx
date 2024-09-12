import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Podcast } from "../types";
import { keyframes, styled } from "@mui/system";
import { usePlayerContext } from "./MainLayout";
import { tipPodclip } from "../api/services.gen";
import { getApiBaseUrl } from "../utils/apiConfig";
import { useAuth } from "../contexts/AuthContext";

interface PodcastCardProps {
  podcast: Podcast;
  isActive: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onProgressChange: (currentTime: number, duration: number) => void;
}

const getRandomGradient = () => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F67280", "#C06C84", "#6C5B7B", "#355C7D", "#F8B195"
  ];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const scrollAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(calc(-100% + 300px)); }
`;

const flashAnimation = keyframes`
  0% { background-color: inherit; }
  50% { background-color: #4CAF50; }
  100% { background-color: inherit; }
`;

const AnimatedIconButton = styled(IconButton)`
  &.flash {
    animation: ${flashAnimation} 0.5s;
  }
`;

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  isActive,
  isPlaying,
  onTogglePlay,
  onProgressChange
}) => {
  const [progress, setProgress] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isTipping, setIsTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState<boolean | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [gradient] = useState(getRandomGradient);
  const { currentTime, duration, audioRef } = usePlayerContext();
  const { token } = useAuth();

  useEffect(() => {
    if (isActive && audioRef.current) {
      setProgress((currentTime / duration) * 100);
    }
  }, [isActive, currentTime, duration, audioRef]);

  useEffect(() => {
    if (titleRef.current) {
      const isOverflowing = titleRef.current.scrollWidth > titleRef.current.clientWidth;
      setShouldAnimate(isOverflowing);
    }
  }, [podcast.title]);

  useEffect(() => {
    if (isActive) {
      onProgressChange(currentTime, duration);
    }
  }, [isActive, currentTime, duration, onProgressChange]);

  const handleTip = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsFlashing(true);
    setIsTipping(true);

    try {
      const response = await tipPodclip({
        baseUrl: getApiBaseUrl(),
        path: { podclip_id: podcast.id },
        query: { amount: 100 }, // You can adjust this amount or make it dynamic
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assume success if we get a response (i.e., no error was thrown)
      console.log("Tip successful:", response);
      setTipSuccess(true);
    } catch (error) {
      console.error("Error tipping podcast:", error);
      setTipSuccess(false);
    } finally {
      setIsTipping(false);
      setTimeout(() => setIsFlashing(false), 500);
      setTimeout(() => setTipSuccess(null), 3000); // Reset tip success state after 3 seconds
    }
  };

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
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        '&:focus': {
          outline: 'none',
        },
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
        <AnimatedIconButton
          onClick={handleTip}
          className={isFlashing ? 'flash' : ''}
          disabled={isTipping}
          sx={{
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
            marginLeft: 1,
          }}
        >
          <AttachMoneyIcon />
        </AnimatedIconButton>
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
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={tipSuccess !== null}
        autoHideDuration={3000}
        onClose={() => setTipSuccess(null)}
        message={tipSuccess ? "Tip sent successfully!" : "Failed to send tip. Please try again."}
      />
    </Box>
  );
};

export default PodcastCard;
