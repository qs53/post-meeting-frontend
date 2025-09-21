import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Close,
  ContentCopy,
  Email,
  Share,
  VideoCall,
  People,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { meetingAPI, settingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import LinkedInAuth from './LinkedInAuth';
import FacebookAuth from './FacebookAuth';

const MeetingDetailModal = ({ open, onClose, meeting }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [followUpEmail, setFollowUpEmail] = useState('');
  const [socialPost, setSocialPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({
    transcript: false,
    email: false,
    social: false,
  });
  const [linkedinAuthOpen, setLinkedinAuthOpen] = useState(false);
  const [linkedinAccessToken, setLinkedinAccessToken] = useState(null);
  const [facebookAuthOpen, setFacebookAuthOpen] = useState(false);
  const [facebookAccessToken, setFacebookAccessToken] = useState(null);

  useEffect(() => {
    if (open && meeting) {
      loadMeetingData();
    }
  }, [open, meeting]);

  const loadMeetingData = async () => {
    if (!meeting) return;

    setLoading(true);
    try {
      // Load transcript
      if (meeting.transcript) {
        setTranscript(meeting.transcript);
      } else {
        setGenerating(prev => ({ ...prev, transcript: true }));
        const response = await meetingAPI.getTranscript(meeting.id);
        setTranscript(response.data.transcript || '');
        setGenerating(prev => ({ ...prev, transcript: false }));
      }
    } catch (error) {
      console.error('Error loading meeting data:', error);
      toast.error('Failed to load meeting data');
      setGenerating(prev => ({ ...prev, transcript: false }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFollowUpEmail = async () => {
    if (!meeting) return;

    setGenerating(prev => ({ ...prev, email: true }));
    try {
      const response = await meetingAPI.generateFollowUpEmail(meeting.id);
      setFollowUpEmail(response.data.email_content);
      toast.success('Follow-up email generated!');
    } catch (error) {
      console.error('Error generating follow-up email:', error);
      toast.error('Failed to generate follow-up email');
    } finally {
      setGenerating(prev => ({ ...prev, email: false }));
    }
  };

  const handleGenerateSocialPost = async (platform = 'linkedin') => {
    if (!meeting) return;
    
    setGenerating(prev => ({ ...prev, social: true }));
    try {
      // Get custom prompt from settings for LinkedIn and Facebook
      let customPrompt = null;
      if (platform === 'linkedin' || platform === 'facebook') {
        try {
          const settingsResponse = await settingsAPI.getSettings();
          customPrompt = platform === 'linkedin'
            ? settingsResponse.data.linkedinPrompt
            : settingsResponse.data.facebookPrompt;
        } catch (error) {
          console.warn('Could not fetch custom prompt, using default');
        }
      }

      const response = await meetingAPI.generateSocialPost(meeting.id, platform, customPrompt);
      setSocialPost(response.data.post);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} post generated!`);
    } catch (error) {
      console.error('Error generating social post:', error);
      toast.error('Error generating social post');
    } finally {
      setGenerating(prev => ({ ...prev, social: false }));
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handlePostToSocial = async (platform) => {
    if (!socialPost) return;
    
    // Check if authentication is needed
    if (platform === 'linkedin' && !linkedinAccessToken) {
      setLinkedinAuthOpen(true);
      return;
    }
    
    if (platform === 'facebook' && !facebookAccessToken) {
      setFacebookAuthOpen(true);
      return;
    }
    
    try {
      let accessToken;
      if (platform === 'linkedin') {
        accessToken = linkedinAccessToken || 'mock_linkedin_access_token';
      } else if (platform === 'facebook') {
        accessToken = facebookAccessToken || 'mock_facebook_access_token';
      }
      
      const response = await meetingAPI.postToSocial(meeting.id, platform, {
        access_token: accessToken,
        content: socialPost.content
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.error('Failed to post to social media');
      }
    } catch (error) {
      console.error('Error posting to social media:', error);
      toast.error('Failed to post to social media');
    }
  };

  const handleLinkedInAuthSuccess = (accessToken) => {
    setLinkedinAccessToken(accessToken);
    setLinkedinAuthOpen(false);
    // Automatically post after successful auth
    handlePostToSocial('linkedin');
  };

  const handleFacebookAuthSuccess = (accessToken) => {
    setFacebookAccessToken(accessToken);
    setFacebookAuthOpen(false);
    // Automatically post after successful auth
    handlePostToSocial('facebook');
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'zoom':
        return <VideoCall color="primary" />;
      case 'teams':
        return <VideoCall color="info" />;
      case 'google_meet':
        return <VideoCall color="success" />;
      default:
        return <VideoCall color="default" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'zoom':
        return 'primary';
      case 'teams':
        return 'info';
      case 'google_meet':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{meeting.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Meeting Info */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getPlatformIcon(meeting.platform)}
            <Typography variant="body1" color="text.secondary">
              {meeting.platform || 'Unknown platform'}
            </Typography>
            <Chip
              label={meeting.status || 'Completed'}
              color="success"
              size="small"
              icon={<CheckCircle />}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {meeting.start_time 
                ? format(new Date(meeting.start_time), 'MMM dd, yyyy - h:mm a')
                : 'Unknown date'
              }
            </Typography>
          </Box>

          {meeting.attendees && meeting.attendees.length > 0 && (
            <Box display="flex" alignItems="center" gap={2}>
              <People fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Transcript" />
          <Tab label="Follow-up Email" />
          <Tab label="Social Media" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Meeting Transcript
            </Typography>
            {generating.transcript ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TextField
                multiline
                rows={10}
                fullWidth
                value={transcript}
                variant="outlined"
                placeholder="Meeting transcript will appear here..."
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
            )}
            {transcript && (
              <Button
                startIcon={<ContentCopy />}
                onClick={() => handleCopyToClipboard(transcript)}
                variant="outlined"
              >
                Copy Transcript
              </Button>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Follow-up Email
              </Typography>
              <Button
                variant="contained"
                startIcon={<Email />}
                onClick={handleGenerateFollowUpEmail}
                disabled={generating.email}
              >
                {generating.email ? 'Generating...' : 'Generate Email'}
              </Button>
            </Box>
            
            {generating.email && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}
            
            {followUpEmail && (
              <Box>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  value={followUpEmail}
                  variant="outlined"
                  placeholder="Follow-up email will appear here..."
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopyToClipboard(followUpEmail)}
                  variant="outlined"
                >
                  Copy Email
                </Button>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Social Media Post
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => handleGenerateSocialPost('linkedin')}
                  disabled={generating.social}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleGenerateSocialPost('facebook')}
                  disabled={generating.social}
                >
                  Facebook
                </Button>
              </Box>
            </Box>
            
            {generating.social && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}
            
            {socialPost && (
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {socialPost.content}
                </Typography>
                
                {socialPost.hashtags && (
                  <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                    {socialPost.hashtags}
                  </Typography>
                )}
                
                {socialPost.disclaimer && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {socialPost.disclaimer}
                  </Typography>
                )}
              </Paper>
            )}
            
            {socialPost && (
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopyToClipboard(socialPost.content)}
                  variant="outlined"
                >
                  Copy
                </Button>
                <Button
                  startIcon={<Share />}
                  onClick={() => handlePostToSocial(socialPost.platform)}
                  variant="contained"
                  color="primary"
                >
                  Post
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      
              {/* LinkedIn Authentication Dialog */}
              <LinkedInAuth
                open={linkedinAuthOpen}
                onClose={() => setLinkedinAuthOpen(false)}
                onSuccess={handleLinkedInAuthSuccess}
              />
              
              {/* Facebook Authentication Dialog */}
              <FacebookAuth
                open={facebookAuthOpen}
                onClose={() => setFacebookAuthOpen(false)}
                onSuccess={handleFacebookAuthSuccess}
              />
            </Dialog>
          );
        };

        export default MeetingDetailModal;
