import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import { Undo as UndoIcon } from '@mui/icons-material';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface CompletedOrdersProps {
  onClose: () => void;
}

const CompletedOrders: React.FC<CompletedOrdersProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const updateOrders = (allOrders: Order[]) => {
      const completedOrders = allOrders
        .filter(order => order.status === 'completed')
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      setOrders(completedOrders);
    };

    // Initial load
    updateOrders(orderStore.getOrders());

    // Subscribe to updates
    orderStore.subscribe(updateOrders);
    return () => {
      orderStore.unsubscribe(updateOrders);
    };
  }, []);

  const handleUndo = (order: Order) => {
    orderStore.updateOrder({
      ...order,
      status: 'pending',
      completedAt: undefined
    });
  };

  return (
    <Box>
      {orders.length === 0 ? (
        <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
          No completed orders
        </Typography>
      ) : (
        <List>
          {orders.map((order, index) => (
            <React.Fragment key={order.orderId}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleUndo(order)}>
                    <UndoIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`Order #${order.orderId}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {order.customer.name}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Completed: {new Date(order.completedAt || '').toLocaleString()}
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
    </Box>
  );
};

export default CompletedOrders; 