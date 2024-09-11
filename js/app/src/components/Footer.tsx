import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

const Footer: React.FC = () => {
  const [value, setValue] = useState(0);

  return (
    <Paper 
      sx={{ 
        position: 'sticky', 
        bottom: 0, 
        left: 0, 
        right: 0,
        bgcolor: 'background.paper' // Use the theme's paper color (#f3edf7)
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ bgcolor: 'transparent' }} // Make the BottomNavigation background transparent
      >
        <BottomNavigationAction label="Discover" icon={<ExploreIcon />} />
        <BottomNavigationAction label="Library" icon={<LibraryMusicIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default Footer;