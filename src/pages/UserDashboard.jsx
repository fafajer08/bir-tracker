import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, TextField, Alert,
  Stack, IconButton,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Edit } from '@mui/icons-material';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

const styleModal = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper',
  boxShadow: 24, p: 4,
  borderRadius: 2,
};

const ITEMS_PER_PAGE = 10;

const validateTinNumber = (tinNumber) => {
  if (!tinNumber) return false;
  const digitsOnly = tinNumber.replace(/[-/]/g, '');
  return /^\d{9}$/.test(digitsOnly);
};

const UserDashboard = () => {
  const { token } = useContext(AuthContext);

  const [tins, setTins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editingTin, setEditingTin] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    birthdate: '',
    tinNumber: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTins, setFilteredTins] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserTins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTins(res.data);
      setCurrentPage(1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch your TINs';
      setError(msg);
      notyf.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUserTins();
  }, [fetchUserTins]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTins(tins);
    } else {
      const q = searchQuery.trim().toLowerCase();
      setFilteredTins(
        tins.filter(tin =>
          tin.name.toLowerCase().includes(q) ||
          tin.tinNumber.toLowerCase().includes(q)
        )
      );
    }
    setCurrentPage(1);
  }, [searchQuery, tins]);

  const totalItems = filteredTins.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTins = filteredTins.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleOpen = (tin = null) => {
    setFormError('');
    if (tin) {
      setEditingTin(tin);
      setForm({
        name: tin.name,
        address: tin.address,
        birthdate: tin.birthdate ? tin.birthdate.slice(0, 10) : '',
        tinNumber: tin.tinNumber,
        date: tin.date ? tin.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      setEditingTin(null);
      setForm({
        name: '',
        address: '',
        birthdate: '',
        tinNumber: '',
        date: new Date().toISOString().slice(0, 10),
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name || !form.address || !form.birthdate || !form.tinNumber || !form.date) {
      setFormError('Please fill all required fields.');
      notyf.error('Please fill all required fields.');
      return;
    }

    if (!validateTinNumber(form.tinNumber)) {
      setFormError('TIN Number must contain exactly 9 digits (excluding / or -).');
      notyf.error('TIN Number must contain exactly 9 digits (excluding / or -).');
      return;
    }

    try {
      if (editingTin) {
        await api.put(`/tins/${editingTin._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notyf.success('TIN updated successfully');
      } else {
        await api.post('/tins', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notyf.success('TIN created successfully');
      }
      fetchUserTins();
      handleClose();
    } catch (err) {
      setFormError('Operation failed. Please try again.');
      notyf.error('Operation failed. Please try again.');
    }
  };

  // Pagination handlers with wrap-around and no disabling
  const handlePrevPage = () => {
    setCurrentPage(prev => (prev === 1 ? totalPages : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev === totalPages ? 1 : prev + 1));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>User Dashboard - Your TINs</Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Button variant="contained" onClick={() => handleOpen()}>
          Create New TIN
        </Button>

        <TextField
          size="small"
          placeholder="Search by Name or TIN Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250 }}
        />
      
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table aria-label="tin table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Birthdate</TableCell>
              <TableCell>TIN Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : paginatedTins.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No TINs found.</TableCell></TableRow>
            ) : (
              paginatedTins.map(tin => (
                <TableRow key={tin._id}>
                  <TableCell>{tin.name}</TableCell>
                  <TableCell>{tin.address}</TableCell>
                  <TableCell>{tin.birthdate ? tin.birthdate.slice(0, 10) : '-'}</TableCell>
                  <TableCell>{tin.tinNumber}</TableCell>
                  <TableCell>{tin.date ? tin.date.slice(0, 10) : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(tin)}
                      aria-label="Edit TIN"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mt={2}>
          <IconButton
            onClick={handlePrevPage}
            aria-label="Previous Page"
            size="small"
          >
            <ArrowBackIos fontSize="small" />
          </IconButton>

          <Typography variant="body2" sx={{ mx: 2 }}>
            Page {currentPage} of {totalPages}
          </Typography>

          <IconButton
            onClick={handleNextPage}
            aria-label="Next Page"
            size="small"
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {/* Modal for create/edit */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={styleModal} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" mb={2}>
            {editingTin ? 'Edit TIN' : 'Create New TIN'}
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Birthdate"
            name="birthdate"
            type="date"
            value={form.birthdate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="TIN Number"
            name="tinNumber"
            value={form.tinNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />

          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editingTin ? 'Update' : 'Create'}</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserDashboard;
