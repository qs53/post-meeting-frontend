import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  PostAdd,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { calendarAPI, socialMediaAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log('Dashboard component rendering');

  useEffect(() => {
    console.log('Dashboard useEffect running');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, socialResponse] = await Promise.all([
        calendarAPI.getEvents(),
        socialMediaAPI.getAccounts(),
      ]);

      setEvents(eventsResponse.data.events || []);
      setSocialAccounts(socialResponse.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events
    .filter(event => new Date(event.start_time) > new Date())
    .slice(0, 5);

  const recentEvents = events
    .filter(event => new Date(event.start_time) < new Date())
    .slice(0, 3);

  const stats = {
    totalMeetings: events.length,
    upcomingMeetings: upcomingEvents.length,
    notetakerEnabled: events.filter(event => event.notetaker_enabled).length,
    socialAccounts: socialAccounts.length,
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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.totalMeetings}</Typography>
                  <Typography color="text.secondary">Total Meetings</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.upcomingMeetings}</Typography>
                  <Typography color="text.secondary">Upcoming</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.notetakerEnabled}</Typography>
                  <Typography color="text.secondary">Notetaker Enabled</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PostAdd color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.socialAccounts}</Typography>
                  <Typography color="text.secondary">Social Accounts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Meetings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Meetings
              </Typography>
              {upcomingEvents.length === 0 ? (
                <Typography color="text.secondary">
                  No upcoming meetings
                </Typography>
              ) : (
                upcomingEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(event.start_time), 'MMM dd, yyyy - h:mm a')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={event.notetaker_enabled ? 'Notetaker ON' : 'Notetaker OFF'}
                        color={event.notetaker_enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/meeting/${event.id}`)}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                ))
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => navigate('/calendar')}>
                View All Meetings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Meetings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Meetings
              </Typography>
              {recentEvents.length === 0 ? (
                <Typography color="text.secondary">
                  No recent meetings
                </Typography>
              ) : (
                recentEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(event.start_time), 'MMM dd, yyyy - h:mm a')}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate(`/meeting/${event.id}`)}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
