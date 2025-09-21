import React, {useState, useEffect} from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Alert,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
} from '@mui/material';
import {
    CalendarToday,
    ToggleOn,
    ToggleOff,
    Visibility,
    PostAdd,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {format, isToday, isTomorrow, isYesterday} from 'date-fns';
import {calendarAPI, meetingAPI} from '../services/api';
import toast from 'react-hot-toast';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await calendarAPI.getEvents();
            setEvents(response.data.events || []);
        } catch (err) {
            setError('Failed to load calendar events');
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const handleNotetakerToggle = async (meetingId, currentValue) => {
        try {
            setUpdating(prev => ({...prev, [meetingId]: true}));

            await meetingAPI.toggleNotetaker(meetingId, !currentValue);

            // Update local state
            setEvents(prev =>
                prev.map(event =>
                    event.id === meetingId
                        ? {...event, notetaker_enabled: !currentValue}
                        : event
                )
            );

            toast.success('Notetaker setting updated');
        } catch (err) {
            toast.error('Failed to update notetaker setting');
        } finally {
            setUpdating(prev => ({...prev, [meetingId]: false}));
        }
    };

    const getEventDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM dd, yyyy');
    };

    const getEventTimeLabel = (date) => {
        return format(date, 'h:mm a');
    };

    const groupEventsByDate = (events) => {
        const grouped = {};
        events.forEach(event => {
            const date = new Date(event.start_time);
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        return grouped;
    };

    const sortedEvents = events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const groupedEvents = groupEventsByDate(sortedEvents);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Calendar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<CalendarToday/>}
                    onClick={fetchEvents}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            )}

            {events.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography variant="h6" align="center" color="text.secondary">
                            No meetings found
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                            Connect your Google Calendar to see your meetings here
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
                        <Grid item xs={12} key={dateKey}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {getEventDateLabel(new Date(dateKey))}
                                    </Typography>
                                    <List>
                                        {dayEvents.map((event, index) => (
                                            <React.Fragment key={event.id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={event.title}
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {getEventTimeLabel(new Date(event.start_time))} - {getEventTimeLabel(new Date(event.end_time))}
                                                                </Typography>
                                                                {event.description && (
                                                                    <Typography variant="body2" color="text.secondary"
                                                                                sx={{mt: 0.5}}>
                                                                        {event.description.length > 100
                                                                            ? `${event.description.substring(0, 100)}...`
                                                                            : event.description
                                                                        }
                                                                    </Typography>
                                                                )}
                                                                <Box sx={{
                                                                    mt: 1,
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    flexWrap: 'wrap'
                                                                }}>
                                                                    <Chip
                                                                        label={event.notetaker_enabled ? 'Notetaker ON' : 'Notetaker OFF'}
                                                                        color={event.notetaker_enabled ? 'success' : 'default'}
                                                                        size="small"
                                                                    />
                                                                    {event.social_media_content && (
                                                                        <Chip
                                                                            label="Content Generated"
                                                                            color="info"
                                                                            size="small"
                                                                        />
                                                                    )}
                                  {event.google_account_name && (
                                    <Chip
                                      label={event.google_account_name}
                                      color="primary"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                  {event.bot_scheduled && (
                                    <Chip
                                      label="Bot Scheduled"
                                      color="success"
                                      size="small"
                                    />
                                  )}
                                                                </Box>
                                                            </Box>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Switch
                                                                        checked={event.notetaker_enabled}
                                                                        onChange={() => handleNotetakerToggle(event.id, event.notetaker_enabled)}
                                                                        disabled={updating[event.id]}
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Notetaker"
                                                                labelPlacement="start"
                                                            />
                                                            <Button
                                                                size="small"
                                                                startIcon={<Visibility/>}
                                                                onClick={() => navigate(`/meeting/${event.id}`)}
                                                            >
                                                                View
                                                            </Button>
                                                        </Box>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index < dayEvents.length - 1 && <Divider/>}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default CalendarPage;
