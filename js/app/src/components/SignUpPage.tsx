import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert, Link } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import {
  UmaConnectButton,
  useOAuth as useNwcOauth,
} from "@uma-sdk/uma-auth-client";
import { NOSTR_ID_NPUB, NOSTR_RELAY_URL } from "../utils/nostr";

const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState(""); // New state for full name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nwcString, setNwcString] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { nwcConnectionUri, token, nwcExpiresAt } = useNwcOauth();

  useEffect(() => {
    if (nwcConnectionUri) {
      setNwcString(nwcConnectionUri);
    }
  }, [nwcConnectionUri]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signup(
        fullName,
        email,
        password,
        nwcString,
        token?.refreshToken,
        nwcExpiresAt,
        !!token ? Math.round(token?.expiresAt / 1000) : undefined
      ); // Include fullName in signup
      navigate("/");
    } catch (error) {
      setError("Sign up failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom color="text.primary">
        Sign Up for Octopod
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: "100%", maxWidth: 400 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          id="fullName"
          label="Full Name"
          name="fullName"
          autoComplete="name"
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ bgcolor: "background.paper" }}
        />
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ bgcolor: "background.paper" }}
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
          sx={{ bgcolor: "background.paper", mb: 2 }}
        />
        <UmaConnectButton
          app-identity-pubkey={NOSTR_ID_NPUB}
          nostr-relay={NOSTR_RELAY_URL}
          redirect-uri={window.location.href}
          required-commands={"pay_invoice,get_balance,make_invoice"}
          style={{
            "--uma-connect-background": "#1DB954",
          }}
        />
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          required
          name="nwcString"
          label="NWC Connection URI"
          id="nwcString"
          value={nwcString}
          onChange={(e) => setNwcString(e.target.value)}
          sx={{ bgcolor: "background.paper" }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={!fullName || !email || !password || !nwcString}
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
