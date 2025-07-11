import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Order, OrderItem } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface PickingInterfaceProps {
  order: Order | null;
  onClose: () => void;
}

const PickingInterface: React.FC<PickingInterfaceProps> = ({ order, onClose }) => {
  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Select an order to start picking
        </Typography>
      </Box>
    );
  }

  const handleComplete = () => {
    orderStore.updateOrderStatus(order.orderId, 'completed');
    onClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Order #{order.orderId}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          <Typography>
            {order.customer.name}
          </Typography>
          {order.shipAttention && (
            <Typography color="text.secondary">
              Attn: {order.shipAttention}
            </Typography>
          )}
          <Typography color="text.secondary">
            {order.customer.address.street}<br />
            {order.customer.address.city}, {order.customer.address.state} {order.customer.address.postal}
          </Typography>
          {order.customer.contact && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Contact: {order.customer.contact}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Items to Pick
      </Typography>
      <List>
        {order.items.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      {item.name}
                    </Typography>
                    <Chip
                      label={`SKU: ${item.sku}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      Quantity: {item.quantity}
                    </Typography>
                    {item.color && (
                      <Typography variant="body2">
                        Color: {item.color}
                      </Typography>
                    )}
                    {item.size && (
                      <Typography variant="body2">
                        Size: {item.size}
                      </Typography>
                    )}
                    {item.lineNote && (
                      <Typography variant="body2" color="text.secondary">
                        Note: {item.lineNote}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
            {index < order.items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleComplete}
        >
          Complete Order
        </Button>
      </Box>
    </Box>
  );
};

export default PickingInterface; 