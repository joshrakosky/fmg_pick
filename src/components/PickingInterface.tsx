import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Checkbox,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface PickingInterfaceProps {
  order: Order | null;
  onClose?: () => void;
}

const PickingInterface: React.FC<PickingInterfaceProps> = ({ order, onClose }) => {
  const [pickedItems, setPickedItems] = useState<{ [key: string]: boolean }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Reset picked items when order changes
    setPickedItems({});
  }, [order?.orderId]);

  if (!order) {
    return null;
  }

  const handleItemPick = (itemIndex: number) => {
    setPickedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const allItemsPicked = order.items.every((_, index) => pickedItems[index]);

  const handleComplete = () => {
    if (order) {
      orderStore.updateOrderStatus(order.orderId, 'completed');
      setShowSuccess(true);
      
      // Close after a short delay
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
  };

  const CustomerInfo = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Typography>
          {order.customer.name}
          {order.shipAttention && (
            <Typography component="span" color="text.secondary">
              {' '}(Attn: {order.shipAttention})
            </Typography>
          )}
        </Typography>
        <Typography color="text.secondary">
          {order.customer.address.street1}<br />
          {order.customer.address.city}, {order.customer.address.state} {order.customer.address.postal}
        </Typography>
      </CardContent>
    </Card>
  );

  const MobileView = () => (
    <Box>
      <CustomerInfo />
      <List>
        {order.items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={item.productName}
                secondary={
                  <>
                    <Typography variant="body2">SKU: {item.sku}</Typography>
                    <Typography variant="body2">Quantity: {item.quantity}</Typography>
                    {item.lineNote && (
                      <Typography variant="body2" color="text.secondary">
                        Note: {item.lineNote}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  checked={pickedItems[index] || false}
                  onChange={() => handleItemPick(index)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const DesktopView = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">Picked</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell align="center">Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={pickedItems[index] || false}
                  onChange={() => handleItemPick(index)}
                />
              </TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                {item.lineNote && (
                  <Typography variant="caption" display="block">
                    Note: {item.lineNote}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Picking Order #{order.orderId}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isMobile ? <MobileView /> : (
          <>
            <CustomerInfo />
            <DesktopView />
          </>
        )}

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleComplete}
            disabled={!allItemsPicked}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
          >
            Complete Picking
          </Button>
        </Box>
      </DialogContent>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Order completed successfully!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default PickingInterface; 