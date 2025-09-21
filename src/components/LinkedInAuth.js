import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LinkedIn } from '@mui/icons-material';
import { socialMediaAPI } from '../services/api';
import toast from 'react-hot-toast';

const LinkedInAuth = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    setLoading(true);
    try {
      // Get LinkedIn auth URL from backend
      const response = await socialMediaAPI.connectAccount('linkedin');
      const authUrl = response.data.auth_url;
      
      // Open LinkedIn auth in popup
      const popup = window.open(
        authUrl,
        'linkedin-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for popup close and check for success
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setLoading(false);
          
          // Check if we have a success URL in localStorage (set by AuthSuccessPage)
          const linkedinSuccess = localStorage.getItem('linkedin_auth_success');
          if (linkedinSuccess) {
            localStorage.removeItem('linkedin_auth_success');
            const authData = JSON.parse(linkedinSuccess);
            toast.success('LinkedIn authentication successful!');
            onSuccess(authData.access_token);
            onClose();
          } else {
            toast.error('LinkedIn authentication was cancelled or failed');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error initiating LinkedIn auth:', error);
      toast.error('Failed to initiate LinkedIn authentication');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LinkedIn color="primary" />
          <Typography variant="h6">Connect LinkedIn Account</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          To post to LinkedIn, you need to connect your LinkedIn account first.
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          This will allow the app to post content to your LinkedIn profile on your behalf.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          You'll be redirected to LinkedIn to authorize the app. Once authorized, you can start posting content directly from your meetings.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleLinkedInAuth}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <LinkedIn />}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect LinkedIn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkedInAuth;
