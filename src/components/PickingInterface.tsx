import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface PickingInterfaceProps {
  order: Order | null;
  onClose: () => void;
}

const PickingInterface: React.FC<PickingInterfaceProps> = ({ order, onClose }) => {
  if (!order) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1">Select an order to start picking</Typography>
      </Paper>
    );
  }

  const handleComplete = () => {
    if (order) {
      orderStore.updateOrder({
        ...order,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      onClose();
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Order #{order.orderId}</Typography>
        <Typography variant="subtitle1">Customer: {order.customer.name}</Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {order.items.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="body2">SKU: {item.sku}</Typography>
                <Typography variant="body2">Quantity: {item.quantity}</Typography>
                {item.color && (
                  <Typography variant="body2">Color: {item.color}</Typography>
                )}
                {item.size && (
                  <Typography variant="body2">Size: {item.size}</Typography>
                )}
                {item.lineNote && (
                  <Typography variant="body2" color="text.secondary">
                    Note: {item.lineNote}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={handleComplete} variant="contained" color="primary">
          Complete Order
        </Button>
      </Box>
    </Paper>
  );
};

export default PickingInterface; 