import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Notyf } from 'notyf';

const notyf = new Notyf();

const AccountTab = () => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [initialData, setInitialData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email } = res.data;
        setForm({ name, email, password: '', confirmPassword: '' });
        setInitialData({ name, email });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const isFormChanged = () =>
    form.name !== initialData.name ||
    form.email !== initialData.email ||
    form.password !== '' ||
    form.confirmPassword !== '';

  // Check if passwords match
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormChanged()) return;

    if (form.password && !passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const { confirmPassword, ...payload } = form; // exclude confirmPassword from payload
      await api.put('/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInitialData({ name: form.name, email: form.email });
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      setSuccess('Profile updated successfully');
      notyf.success('Profile updated');
    } catch (err) {
      setError('Update failed');
      notyf.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography mt={2}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={450} mx="auto" p={3}>
      <Typography variant="h5" mb={2}>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            helperText="Leave blank to keep current password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            error={form.password && !passwordsMatch}
            helperText={
              form.password && !passwordsMatch ? "Passwords don't match" : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    aria-label="toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box textAlign="right" mt={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormChanged() || updating || (form.password && !passwordsMatch)}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default AccountTab;
