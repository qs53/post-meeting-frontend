import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  History,
  PlayArrow,
  Edit,
  Share,
  VideoCall,
  People,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { meetingAPI } from '../services/api';
import toast from 'react-hot-toast';
import MeetingDetailModal from '../components/MeetingDetailModal';

const PastMeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingDetailOpen, setMeetingDetailOpen] = useState(false);

  useEffect(() => {
    fetchPastMeetings();
  }, []);

  const fetchPastMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingAPI.getPastMeetings();
      console.log('response.data fdfdfdfdf')
      console.log(response.data)
      setMeetings(response.data.meetings || []);
    } catch (err) {
      setError('Failed to load past meetings');
      toast.error('Failed to load past meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailOpen(true);
  };

  const handleCloseMeetingDetail = () => {
    setMeetingDetailOpen(false);
    setSelectedMeeting(null);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Past Meetings
        </Typography>
        <Button
          variant="contained"
          startIcon={<History />}
          onClick={fetchPastMeetings}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {meetings.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No past meetings found
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Meetings with completed transcripts will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid item xs={12} key={meeting.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {meeting.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {meeting.start_time
                            ? format(new Date(meeting.start_time), 'MMM dd, yyyy - h:mm a')
                            : 'Unknown date'
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getPlatformIcon(meeting.platform)}
                        <Typography variant="body2" color="text.secondary">
                          {meeting.platform || 'Unknown platform'}
                        </Typography>
                      </Box>
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <People fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {meeting.transcript && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {meeting.transcript.length > 200 
                        ? `${meeting.transcript.substring(0, 200)}...`
                        : meeting.transcript
                      }
                    </Typography>
                  )}

                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewMeeting(meeting)}
                      variant="contained"
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        open={meetingDetailOpen}
        onClose={handleCloseMeetingDetail}
        meeting={selectedMeeting}
      />
    </Container>
  );
};

export default PastMeetingsPage;
