import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Pagination,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';

interface CompletedOrdersProps {
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

const CompletedOrders: React.FC<CompletedOrdersProps> = ({ onClose }) => {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const handleOrders = (orders: Order[]) => {
      const completed = orders.filter(order => order.status === 'completed')
        .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime());
      setCompletedOrders(completed);
    };

    const unsubscribe = orderStore.subscribe(handleOrders);
    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(completedOrders.length / ITEMS_PER_PAGE);
  const currentOrders = completedOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleUndoComplete = (order: Order) => {
    orderStore.updateOrderStatus(order.orderId, 'pending');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Completed Orders
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {completedOrders.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No completed orders yet
          </Typography>
        ) : (
          <>
            <List>
              {currentOrders.map((order, index) => (
                <React.Fragment key={order.orderId}>
                  <ListItem
                    secondaryAction={
                      <Tooltip title="Undo complete">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleUndoComplete(order)}
                          size="small"
                        >
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            Order #{order.orderId}
                          </Typography>
                          <Chip
                            label="Completed"
                            size="small"
                            color="success"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">
                            Customer: {order.customer.name}
                          </Typography>
                          <Typography variant="body2">
                            Items: {order.items.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed: {new Date(order.completedAt || '').toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < currentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CompletedOrders; 