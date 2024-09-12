import React, { useCallback } from "react";
import { Box, IconButton, CircularProgress, Typography } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import PodcastCard from "./PodcastCard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { usePlayerContext } from "./MainLayout";

const VerticalSwipePlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    podcasts,
    currentIndex,
    isPlaying,
    setIsPlaying,
    handleChangeIndex,
    handleProgressChange,
    isLoading,
  } = usePlayerContext();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSwipeChange = useCallback((index: number) => {
    console.log(`Swipe change detected. New index: ${index}`); // Add this log
    handleChangeIndex(index);
  }, [handleChangeIndex]);

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
          onClick={handleProfileClick}
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
      {isLoading && podcasts.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.primary">
            Loading your personalized playlist...
          </Typography>
        </Box>
      ) : podcasts.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.default",
            padding: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.primary" gutterBottom>
            No podcasts available at the moment.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please check back later or refresh the page.
          </Typography>
        </Box>
      ) : (
        <SwipeableViews
          axis="y"
          index={currentIndex}
          onChangeIndex={handleSwipeChange}
          enableMouseEvents
          resistance
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
                onProgressChange={handleProgressChange}
              />
            </Box>
          ))}
        </SwipeableViews>
      )}
    </Box>
  );
};

export default VerticalSwipePlayer;
