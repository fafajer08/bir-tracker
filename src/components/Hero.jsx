import React from 'react';
import { Box, Typography, Button } from '@mui/material';


const Hero = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bgcolor: '#f5f5f5',
      p: { xs: 3, md: 8 },
      flexWrap: 'wrap',
      gap: 4,
    }}
  >
    {/* Left side: Logo + Text */}
    <Box sx={{ flex: 1, minWidth: 280 }}>

      <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
        Your Trusted Legal Partner
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Need professional legal assistance? We’re here to guide you through every step with expertise and care.
      </Typography>

      <Button
        variant="contained"
        size="large"
        href="#contact"
        sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5d4037' } }}
      >
        Contact Us
      </Button>
    </Box>

    {/* Right side: Image */}
    <Box sx={{ flex: 1, minWidth: 280, textAlign: 'right' }}>
      <img
        src="https://media.istockphoto.com/id/1449334081/photo/statue-of-lady-justice-on-desk-of-a-judge-or-lawyer.jpg?s=612x612&w=0&k=20&c=139ZS1ycMRXBqnPEWV3l08zBLNe40WPiAudVnmeQrl8="
        alt="Law Office Building"
        style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
      />
    </Box>
  </Box>
);

export default Hero;
  