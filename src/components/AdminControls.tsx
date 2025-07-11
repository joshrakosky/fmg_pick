import React from 'react';
import { Button, Box } from '@mui/material';
import { orderStore } from '../services/orderStore';

const AdminControls: React.FC = () => {
  const clearOrders = () => {
    if (window.confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
      // Clear all orders by updating each one to completed status
      const orders = orderStore.getOrders();
      orders.forEach(order => {
        orderStore.updateOrder({
          ...order,
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      });
      localStorage.clear();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="error"
        onClick={clearOrders}
        fullWidth
      >
        Clear All Orders
      </Button>
    </Box>
  );
};

export default AdminControls; 