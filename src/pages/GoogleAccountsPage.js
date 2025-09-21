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
  IconButton,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add,
  Delete,
  Refresh,
  Google,
  Email,
  CalendarToday,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const GoogleAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingAccount, setAddingAccount] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getGoogleAccounts();
      setAccounts(response.data || []);
    } catch (err) {
      setError('Failed to load Google accounts');
      toast.error('Failed to load Google accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setAddingAccount(true);
      const response = await userAPI.getGoogleAuthUrl();
      // Open Google OAuth in a popup window
      const popup = window.open(
        response.data.auth_url,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for the popup to close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setAddingAccount(false);
          // Refresh accounts list
          fetchAccounts();
        }
      }, 1000);
      
    } catch (err) {
      setError('Failed to initiate Google account connection');
      toast.error('Failed to connect Google account');
      setAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await userAPI.disconnectGoogleAccount(accountId);
      toast.success('Google account disconnected successfully');
      fetchAccounts();
    } catch (err) {
      toast.error('Failed to disconnect Google account');
    } finally {
      setDeleteDialog({ open: false, account: null });
    }
  };

  const handleSyncAccount = async (accountId) => {
    try {
      await userAPI.syncGoogleAccount(accountId);
      toast.success('Account synced successfully');
      fetchAccounts();
    } catch (err) {
      toast.error('Failed to sync account');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'syncing':
        return <CircularProgress size={20} />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'error':
        return 'error';
      case 'syncing':
        return 'info';
      default:
        return 'warning';
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
          Google Accounts
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAccounts}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddAccount}
            disabled={addingAccount}
          >
            {addingAccount ? 'Connecting...' : 'Add Account'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {accounts.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Google sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Google accounts connected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Connect your Google accounts to sync calendar events and enable meeting notetaking
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddAccount}
                disabled={addingAccount}
                size="large"
              >
                {addingAccount ? 'Connecting...' : 'Connect First Account'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} key={account.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={account.picture}
                      sx={{ mr: 2, bgcolor: 'primary.main' }}
                    >
                      <Google />
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6" gutterBottom>
                        {account.name || account.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {account.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(account.status)}
                      <Chip
                        label={account.status || 'Unknown'}
                        color={getStatusColor(account.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {account.events_count || 0} events
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">
                        {account.is_primary ? 'Primary' : 'Secondary'}
                      </Typography>
                    </Box>
                  </Box>

                  {account.last_sync && (
                    <Typography variant="caption" color="text.secondary">
                      Last synced: {new Date(account.last_sync).toLocaleString()}
                    </Typography>
                  )}

                  {account.error_message && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {account.error_message}
                    </Alert>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={account.status === 'syncing'}
                  >
                    Sync
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialog({ open: true, account })}
                    disabled={account.is_primary}
                  >
                    Disconnect
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, account: null })}
      >
        <DialogTitle>Disconnect Google Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to disconnect {deleteDialog.account?.email}? 
            This will stop syncing calendar events from this account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, account: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteAccount(deleteDialog.account?.id)}
            color="error"
            variant="contained"
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GoogleAccountsPage;
