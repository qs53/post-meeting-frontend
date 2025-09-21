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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import {
  Settings,
  Save,
  Refresh,
  Notifications,
  Schedule,
  VideoCall,
} from '@mui/icons-material';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    recallJoinBeforeMinutes: 5,
    enableNotifications: true,
    autoGenerateContent: true,
    defaultPlatform: 'zoom',
    linkedinPrompt: 'Draft a LinkedIn post (120-180 words) that summarizes the meeting value in first person. Use a warm, conversational tone consistent with an experienced financial advisor. End with up to three hashtags. Return only the post text.',
    facebookPrompt: 'Write a Facebook post (100-150 words) that summarizes the meeting value in first person. Use a friendly, conversational tone that\'s engaging for Facebook. Include 2-3 relevant hashtags at the end. Make it shareable and engaging for Facebook audience. Return only the post text.',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.updateSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field) => (event) => {
    const value = parseInt(event.target.value) || 0;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchSettings}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Recall.ai Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <VideoCall color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Recall.ai Bot Settings
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Join Meeting Before (minutes)"
                type="number"
                value={settings.recallJoinBeforeMinutes}
                onChange={handleNumberChange('recallJoinBeforeMinutes')}
                helperText="How many minutes before the meeting should the Recall bot join?"
                inputProps={{ min: 1, max: 30 }}
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                The Recall bot will automatically join your meetings {settings.recallJoinBeforeMinutes} minute{settings.recallJoinBeforeMinutes !== 1 ? 's' : ''} before they start to ensure it's ready to record.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* LinkedIn Prompt Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">
                  LinkedIn Post Prompt
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Custom LinkedIn Post Prompt"
                value={settings.linkedinPrompt}
                onChange={handleChange('linkedinPrompt')}
                helperText="Customize how AI generates your LinkedIn posts. Use {meeting_title} and {transcript} as placeholders."
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                This prompt will be used to generate LinkedIn posts from your meeting transcripts. 
                The AI will receive the meeting title and transcript as context.
              </Alert>

              <Typography variant="body2" color="text.secondary">
                <strong>Available placeholders:</strong><br />
                • <code>{'{meeting_title}'}</code> - The title of the meeting<br />
                • <code>{'{transcript}'}</code> - The full meeting transcript
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Facebook Prompt Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Facebook Post Prompt
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Custom Facebook Post Prompt"
                value={settings.facebookPrompt}
                onChange={handleChange('facebookPrompt')}
                helperText="Customize how AI generates your Facebook posts. Use {meeting_title} and {transcript} as placeholders."
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                This prompt will be used to generate Facebook posts from your meeting transcripts. 
                The AI will receive the meeting title and transcript as context.
              </Alert>

              <Typography variant="body2" color="text.secondary">
                <strong>Available placeholders:</strong><br />
                • <code>{'{meeting_title}'}</code> - The title of the meeting<br />
                • <code>{'{transcript}'}</code> - The full meeting transcript
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Changes are saved automatically when you click Save
              </Typography>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
