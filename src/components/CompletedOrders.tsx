import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface CompletedOrdersProps {
  onClose: () => void;
}

const CompletedOrders: React.FC<CompletedOrdersProps> = ({ onClose }) => {
  const [completedOrders, setCompletedOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    const updateOrders = (orders: Order[]) => {
      const completed = orders.filter(order => order.status === 'completed');
      setCompletedOrders(completed);
    };

    // Initial load
    updateOrders(orderStore.getOrders());

    // Subscribe to updates
    const unsubscribe = orderStore.subscribe(updateOrders);
    return () => unsubscribe();
  }, []);

  const handleUndo = (order: Order) => {
    orderStore.updateOrder({
      ...order,
      status: 'pending'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Completed Orders
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {completedOrders.map((order) => (
          <React.Fragment key={order.orderId}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => handleUndo(order)}>
                  <UndoIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={order.customer.name}
                secondary={`Order #${order.orderId}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
        {completedOrders.length === 0 && (
          <ListItem>
            <ListItemText primary="No completed orders" />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default CompletedOrders; 