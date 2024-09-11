import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header: React.FC = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: 'text.primary',
            fontWeight: 'bold'
          }}
        >
          Octopod
        </Typography>
        <Box>
          <IconButton color="default" aria-label="profile">
            <AccountCircleIcon sx={{ color: 'text.primary' }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
