import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Order, OrderItem } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface PickingInterfaceProps {
  order: Order | null;
  onClose: () => void;
}

const PickingInterface: React.FC<PickingInterfaceProps> = ({ order, onClose }) => {
  const [pickedItems, setPickedItems] = useState<{ [key: string]: boolean }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  if (!order) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1">Select an order to start picking</Typography>
      </Paper>
    );
  }

  const handleToggleItem = (itemId: string) => {
    setPickedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const allItemsPicked = order.items.every(item => pickedItems[item.id]);

  const handleComplete = () => {
    if (!allItemsPicked) {
      setShowConfirm(true);
      return;
    }
    completeOrder();
  };

  const completeOrder = () => {
    orderStore.updateOrder({
      ...order,
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Order #{order.orderId}</Typography>
        <Typography variant="subtitle1">Customer: {order.customer.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Ship To: {order.customer.address.street}
          {order.customer.address.street2 && `, ${order.customer.address.street2}`}
          <br />
          {order.customer.address.city}, {order.customer.address.state} {order.customer.address.postal}
        </Typography>
        {order.shipAttention && (
          <Typography variant="body2" color="text.secondary">
            Attention: {order.shipAttention}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {!allItemsPicked && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Check each item as you pick it to ensure accuracy
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {order.items.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: pickedItems[item.id] ? 'action.selected' : 'background.paper',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <Checkbox
                  checked={pickedItems[item.id] || false}
                  onChange={() => handleToggleItem(item.id)}
                  sx={{ mr: 1 }}
                />
                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          onClick={handleComplete} 
          variant="contained" 
          color="primary"
          disabled={order.items.length === 0}
        >
          Complete Order
        </Button>
      </Box>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Incomplete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Not all items have been checked. Are you sure you want to complete this order?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={completeOrder} color="primary" variant="contained">
            Complete Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PickingInterface; 