import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
}

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const updateOrders = (allOrders: Order[]) => {
      const activeOrders = allOrders
        .filter(order => order.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(activeOrders);
    };

    // Initial load
    updateOrders(orderStore.getOrders());

    // Subscribe to updates
    orderStore.subscribe(updateOrders);
    return () => {
      orderStore.unsubscribe(updateOrders);
    };
  }, []);

  const handleClearAll = () => {
    const clearedOrders = orders.map(order => ({
      ...order,
      status: 'completed' as const,
      completedAt: new Date().toISOString()
    }));
    clearedOrders.forEach(order => orderStore.updateOrder(order));
    onOrderSelect(null);
    setShowClearConfirm(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Active Orders ({orders.length})
        </Typography>
        {orders.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setShowClearConfirm(true)}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Paper sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
        {orders.length === 0 ? (
          <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
            No active orders
          </Typography>
        ) : (
          <List>
            {orders.map((order, index) => (
              <React.Fragment key={order.orderId}>
                <ListItem
                  button
                  selected={selectedOrder?.orderId === order.orderId}
                  onClick={() => onOrderSelect(order)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Order #{order.orderId}</span>
                        <Chip
                          label={`${order.items.length} items`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {order.customer.name}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          {order.customer.address.city}, {order.customer.address.state}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < orders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Dialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      >
        <DialogTitle>Clear All Orders?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark all orders as completed? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList; 