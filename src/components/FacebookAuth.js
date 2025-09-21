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
import { Facebook } from '@mui/icons-material';
import { socialMediaAPI } from '../services/api';
import toast from 'react-hot-toast';

const FacebookAuth = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      // Get Facebook auth URL from backend
      const response = await socialMediaAPI.connectAccount('facebook');
      const authUrl = response.data.auth_url;
      
      // Open Facebook auth in popup
      const popup = window.open(
        authUrl,
        'facebook-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for popup close and check for success
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setLoading(false);
          
          // Check if we have a success URL in localStorage (set by AuthSuccessPage)
          const facebookSuccess = localStorage.getItem('facebook_auth_success');
          if (facebookSuccess) {
            localStorage.removeItem('facebook_auth_success');
            const authData = JSON.parse(facebookSuccess);
            toast.success('Facebook authentication successful!');
            onSuccess(authData.access_token);
            onClose();
          } else {
            toast.error('Facebook authentication was cancelled or failed');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error initiating Facebook auth:', error);
      toast.error('Failed to initiate Facebook authentication');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Facebook color="primary" />
          <Typography variant="h6">Connect Facebook Account</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Note:</strong> Facebook posting is currently in simulation mode. Real posting requires Facebook app review.
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          This will connect your Facebook account for future posting capabilities. Currently, posts are simulated for demonstration purposes.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>For real Facebook posting, you would need to:</strong>
        </Typography>
        
        <Typography variant="body2" color="text.secondary" component="div">
          • Submit your Facebook app for review<br/>
          • Get approved for publishing permissions<br/>
          • Configure proper OAuth scopes
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleFacebookAuth}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Facebook />}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Facebook'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacebookAuth;
