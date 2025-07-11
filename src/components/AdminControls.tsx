import React from 'react';
import { Box, Button } from '@mui/material';
import { orderStore } from '../services/orderStore';

const AdminControls: React.FC = () => {
  const clearOrders = () => {
    if (window.confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
      orderStore.setOrders([]);
      localStorage.clear();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
      <Button 
        variant="outlined" 
        color="error" 
        onClick={clearOrders}
        size="small"
      >
        Clear All Orders
      </Button>
    </Box>
  );
};

export default AdminControls; 