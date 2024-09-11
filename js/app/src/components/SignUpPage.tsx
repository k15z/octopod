import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nwcString, setNwcString] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password, nwcString);
      navigate('/');
    } catch (error) {
      setError('Sign up failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom color="text.primary">
        Sign Up for Octopod
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
        />
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
        />
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          name="nwcString"
          label="NWC String"
          id="nwcString"
          value={nwcString}
          onChange={(e) => setNwcString(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={!email || !password || !nwcString}
        >
          Sign Up
        </Button>
      </Box>
      <Box mt={2}>
        <Link component={RouterLink} to="/login" color="primary">
          Already have an account? Log in
        </Link>
      </Box>
    </Box>
  );
};

export default SignUpPage;