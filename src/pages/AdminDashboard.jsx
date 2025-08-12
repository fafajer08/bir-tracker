import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, CircularProgress, Alert,
  Stack, IconButton, TextField
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Edit, Delete, Block, Check } from '@mui/icons-material';
import { format } from 'date-fns';
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

const TinFormModal = ({ open, onClose, onSubmit, formData, setFormData, formError, loading }) => {
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={styleModal} component="form" onSubmit={onSubmit}>
        <Typography variant="h6" mb={2}>
          {formData.editing ? 'Edit TIN' : 'Create New TIN'}
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        <TextField
          label="TIN Number"
          name="tinNumber"
          value={formData.tinNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          inputProps={{ pattern: "[0-9/-]*" }}
          disabled={loading}
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />

        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {formData.editing ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  const [tins, setTins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    birthdate: '',
    tinNumber: '',
    date: new Date().toISOString().slice(0, 10),
    editing: false,
    id: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTins, setFilteredTins] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchTins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTins(res.data);
      setCurrentPage(1); // reset page 1 on fetch
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch TINs';
      setError(msg);
      notyf.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTins();
  }, [fetchTins]);

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

  const openModal = (tin = null) => {
    setFormError('');
    if (tin) {
      setFormData({
        name: tin.name || '',
        address: tin.address || '',
        birthdate: tin.birthdate ? format(new Date(tin.birthdate), 'yyyy-MM-dd') : '',
        tinNumber: tin.tinNumber || '',
        date: tin.date ? format(new Date(tin.date), 'yyyy-MM-dd') : new Date().toISOString().slice(0, 10),
        editing: true,
        id: tin._id,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        birthdate: '',
        tinNumber: '',
        date: new Date().toISOString().slice(0, 10),
        editing: false,
        id: null,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, address, birthdate, tinNumber, date, editing, id } = formData;

    if (!name || !address || !birthdate || !tinNumber || !date) {
      setFormError('Please fill all required fields.');
      notyf.error('Please fill all required fields.');
      return;
    }

    if (!validateTinNumber(tinNumber)) {
      setFormError('TIN Number must contain exactly 9 digits (excluding / or -).');
      notyf.error('TIN Number must contain exactly 9 digits (excluding / or -).');
      return;
    }

    setActionLoading(true);
    try {
      if (editing && id) {
        await api.put(`/tins/${id}`, { name, address, birthdate, tinNumber, date }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notyf.success('TIN updated successfully');
      } else {
        await api.post('/tins', { name, address, birthdate, tinNumber, date }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notyf.success('TIN created successfully');
      }
      fetchTins();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      setFormError(msg);
      notyf.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this TIN?')) return;
    setActionLoading(true);
    try {
      await api.put(`/tins/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notyf.success('TIN deactivated successfully');
      fetchTins();
    } catch {
      notyf.error('Failed to deactivate TIN.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this TIN?')) return;
    setActionLoading(true);
    try {
      await api.put(`/tins/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notyf.success('TIN activated successfully');
      fetchTins();
    } catch {
      notyf.error('Failed to activate TIN.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this TIN?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/tins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notyf.success('TIN deleted successfully');
      fetchTins();
    } catch {
      notyf.error('Failed to delete TIN.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Button variant="contained" onClick={() => openModal()}>
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
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedTins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No TINs found.</TableCell>
              </TableRow>
            ) : (
              paginatedTins.map(tin => (
                <TableRow key={tin._id} sx={{ opacity: tin.isActive ? 1 : 0.5 }}>
                  <TableCell>{tin.name}</TableCell>
                  <TableCell>{tin.address}</TableCell>
                  <TableCell>{tin.birthdate ? format(new Date(tin.birthdate), 'yyyy-MM-dd') : '-'}</TableCell>
                  <TableCell>{tin.tinNumber}</TableCell>
                  <TableCell>{tin.date ? format(new Date(tin.date), 'yyyy-MM-dd') : '-'}</TableCell>
                  <TableCell>{tin.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        color="primary"
                        onClick={() => openModal(tin)}
                        aria-label="Edit TIN"
                        disabled={actionLoading}
                      >
                        <Edit />
                      </IconButton>

                      {tin.isActive ? (
                        <IconButton
                          color="warning"
                          onClick={() => handleDeactivate(tin._id)}
                          disabled={actionLoading}
                          aria-label="Deactivate TIN"
                        >
                          <Block />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="success"
                          onClick={() => handleActivate(tin._id)}
                          disabled={actionLoading}
                          aria-label="Activate TIN"
                        >
                          <Check />
                        </IconButton>
                      )}

                      <IconButton
                        color="error"
                        onClick={() => handleDelete(tin._id)}
                        disabled={actionLoading}
                        aria-label="Delete TIN"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
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
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      aria-label="Previous Page"
      size="small"
    >
      <ArrowBackIos fontSize="small" />
    </IconButton>

    <Typography variant="body2" sx={{ mx: 2 }}>
      Page {currentPage} of {totalPages}
    </Typography>

    <IconButton
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      aria-label="Next Page"
      size="small"
    >
      <ArrowForwardIos fontSize="small" />
    </IconButton>
  </Stack>
)}

      <TinFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        loading={actionLoading}
      />
    </Box>
  );
};

export default AdminDashboard;
