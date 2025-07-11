import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
}

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  React.useEffect(() => {
    const updateOrders = (orders: Order[]) => {
      const pendingOrders = orders.filter(order => order.status === 'pending');
      setOrders(pendingOrders);
    };

    updateOrders(orderStore.getOrders());
    const unsubscribe = orderStore.subscribe(updateOrders);
    return () => unsubscribe();
  }, []);

  const handleClearAll = () => {
    orders.forEach(order => {
      orderStore.updateOrder({
        ...order,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });
    });
    onOrderSelect(null);
    setShowClearConfirm(false);
  };

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Active Orders ({orders.length})
          </Typography>
          {orders.length > 0 && (
            <IconButton 
              onClick={() => setShowClearConfirm(true)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {orders.map((order, index) => (
            <React.Fragment key={order.orderId}>
              <ListItem
                button
                selected={selectedOrder?.orderId === order.orderId}
                onClick={() => onOrderSelect(order)}
                sx={{ display: 'block' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          Order #{order.orderId}
                        </Typography>
                        <Chip
                          label={`${order.items.length} items`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={order.customer.name}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(order.orderId);
                    }}
                    size="small"
                  >
                    {expandedOrder === order.orderId ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={expandedOrder === order.orderId}>
                  <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
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
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Items:
                    </Typography>
                    {order.items.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        • {item.quantity}x {item.name}
                        {item.color && ` (${item.color})`}
                        {item.size && ` - ${item.size}`}
                      </Typography>
                    ))}
                  </Box>
                </Collapse>
              </ListItem>
              {index < orders.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {orders.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No active orders"
                secondary="Import orders or complete existing ones"
              />
            </ListItem>
          )}
        </List>
      </Box>

      <Dialog open={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <DialogTitle>Clear All Orders</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark all orders as completed? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearConfirm(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderList; 