import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  People,
  PostAdd,
  Send,
  Refresh,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { calendarAPI, meetingAPI, socialMediaAPI } from '../services/api';
import toast from 'react-hot-toast';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [socialContent, setSocialContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);

  useEffect(() => {
    fetchMeetingData();
    fetchSocialAccounts();
  }, [id]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      const response = await calendarAPI.getEvents();
      const meetingData = response.data.events.find(event => event.id === parseInt(id));
      
      if (!meetingData) {
        setError('Meeting not found');
        return;
      }
      
      setMeeting(meetingData);
      setTranscript(meetingData.transcript || '');
      setSocialContent(meetingData.social_media_content || '');
    } catch (err) {
      setError('Failed to load meeting data');
      toast.error('Failed to load meeting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialAccounts = async () => {
    try {
      const response = await socialMediaAPI.getAccounts();
      setSocialAccounts(response.data || []);
    } catch (err) {
      console.error('Failed to load social accounts:', err);
    }
  };

  const handleTranscriptUpdate = async () => {
    try {
      await meetingAPI.updateTranscript(parseInt(id), transcript);
      toast.success('Transcript updated successfully');
    } catch (err) {
      toast.error('Failed to update transcript');
    }
  };

  const handleGenerateContent = async () => {
    try {
      setGenerating(true);
      const response = await meetingAPI.generateContent(parseInt(id), selectedPlatform);
      setSocialContent(response.data.content);
      setShowGenerateDialog(false);
      toast.success('Social media content generated successfully');
    } catch (err) {
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handlePostToSocial = async () => {
    try {
      setPosting(true);
      await socialMediaAPI.postContent(parseInt(id), selectedPlatform);
      setShowPostDialog(false);
      toast.success(`Successfully posted to ${selectedPlatform}`);
    } catch (err) {
      toast.error(`Failed to post to ${selectedPlatform}`);
    } finally {
      setPosting(false);
    }
  };

  const handleNotetakerToggle = async () => {
    try {
      await meetingAPI.toggleNotetaker(parseInt(id), !meeting.notetaker_enabled);
      setMeeting(prev => ({ ...prev, notetaker_enabled: !prev.notetaker_enabled }));
      toast.success('Notetaker setting updated');
    } catch (err) {
      toast.error('Failed to update notetaker setting');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !meeting) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'Meeting not found'}
        </Alert>
        <Button onClick={() => navigate('/calendar')} sx={{ mt: 2 }}>
          Back to Calendar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {meeting.title}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CalendarToday />}
          onClick={() => navigate('/calendar')}
        >
          Back to Calendar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Meeting Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Date & Time:</strong> {format(new Date(meeting.start_time), 'MMM dd, yyyy - h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                </Typography>
              </Box>
              {meeting.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {meeting.description}
                  </Typography>
                </Box>
              )}
              {meeting.attendees && meeting.attendees.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Attendees:</strong> {meeting.attendees.map(attendee => attendee.email).join(', ')}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={meeting.notetaker_enabled ? 'Notetaker ON' : 'Notetaker OFF'}
                  color={meeting.notetaker_enabled ? 'success' : 'default'}
                  icon={meeting.notetaker_enabled ? <ToggleOn /> : <ToggleOff />}
                />
                <Button
                  size="small"
                  onClick={handleNotetakerToggle}
                >
                  Toggle Notetaker
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Social Media Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PostAdd />}
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={!transcript}
                >
                  Generate Content
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Send />}
                  onClick={() => setShowPostDialog(true)}
                  disabled={!socialContent}
                >
                  Post to Social
                </Button>
              </Box>
              {socialAccounts.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Connected accounts: {socialAccounts.map(acc => acc.platform).join(', ')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transcript */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Transcript
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Enter meeting transcript here..."
                variant="outlined"
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleTranscriptUpdate}
                  disabled={!transcript}
                >
                  Save Transcript
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchMeetingData}
                >
                  Refresh
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Content */}
        {socialContent && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generated Social Media Content
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {socialContent}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => setShowPostDialog(true)}
                  >
                    Post to Social Media
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSocialContent('')}
                  >
                    Clear Content
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Generate Content Dialog */}
      <Dialog open={showGenerateDialog} onClose={() => setShowGenerateDialog(false)}>
        <DialogTitle>Generate Social Media Content</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              label="Platform"
            >
              <MenuItem value="linkedin">LinkedIn</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateContent}
            variant="contained"
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <PostAdd />}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post to Social Dialog */}
      <Dialog open={showPostDialog} onClose={() => setShowPostDialog(false)}>
        <DialogTitle>Post to Social Media</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              label="Platform"
            >
              {socialAccounts.map((account) => (
                <MenuItem key={account.id} value={account.platform}>
                  {account.platform} - {account.account_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {socialAccounts.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No social media accounts connected. Please connect an account first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPostDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePostToSocial}
            variant="contained"
            disabled={posting || socialAccounts.length === 0}
            startIcon={posting ? <CircularProgress size={20} /> : <Send />}
          >
            {posting ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingDetailPage;
