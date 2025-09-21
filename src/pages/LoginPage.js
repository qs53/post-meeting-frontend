import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LoginPage useEffect - isAuthenticated:', isAuthenticated);
    // Check if user is already authenticated
    if (isAuthenticated) {
      console.log('LoginPage - user is authenticated, navigating to dashboard');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.getGoogleAuthUrl();
      console.log("response")
      console.log(response)
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Failed to initiate Google login');
      toast.error('Failed to initiate Google login');
      setLoading(false);
    }
  };


  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Post MeetingGenerator
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Connect your Google Calendar and generate social media content from your meetings
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            By signing in, you agree to connect your Google Calendar to generate meeting-based social media content.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
