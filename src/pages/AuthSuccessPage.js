import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import toast from 'react-hot-toast';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    console.log('AuthSuccessPage mounted');
    const handleAuthSuccess = () => {
      console.log('AuthSuccessPage handleAuthSuccess called');
      try {
        // Check for error first
        const error = searchParams.get('error');
        if (error) {
          console.error('Authentication error:', error);
          toast.error('Authentication failed: ' + error);
          navigate('/login');
          return;
        }

                // Check if this is a social media OAuth callback
                const platform = searchParams.get('platform');
                if (platform === 'linkedin') {
                  const accessToken = searchParams.get('access_token');
                  if (accessToken) {
                    // Store LinkedIn auth success in localStorage for the popup to pick up
                    localStorage.setItem('linkedin_auth_success', JSON.stringify({
                      access_token: accessToken,
                      platform: 'linkedin'
                    }));
                    // Close the popup window
                    window.close();
                    return;
                  }
                }
                
                if (platform === 'facebook') {
                  const accessToken = searchParams.get('access_token');
                  if (accessToken) {
                    // Store Facebook auth success in localStorage for the popup to pick up
                    localStorage.setItem('facebook_auth_success', JSON.stringify({
                      access_token: accessToken,
                      platform: 'facebook'
                    }));
                    // Close the popup window
                    window.close();
                    return;
                  }
                }

        // Extract auth data from URL parameters (Google OAuth)
        const accessToken = searchParams.get('access_token');
        const userData = {
          id: parseInt(searchParams.get('user_id')) || searchParams.get('user_id'),
          email: searchParams.get('user_email'),
          name: searchParams.get('user_name'),
          picture: searchParams.get('user_picture') || null
        };

        console.log('Auth success - extracted data:', { accessToken, userData });
        console.log('URL search params:', Object.fromEntries(searchParams.entries()));

        if (accessToken && userData.email) {
          console.log('Attempting to login user...');
          // Login the user
          login(userData, accessToken);
          console.log('Login called, navigating to dashboard...');
          toast.success('Successfully logged in!');
          navigate('/');
        } else {
          console.error('Missing auth data:', { accessToken, userData });
          toast.error('Authentication failed - missing data');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth success error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [searchParams, login, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthSuccessPage;
