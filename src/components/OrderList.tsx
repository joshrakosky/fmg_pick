import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Pagination,
  Button
} from '@mui/material';
import { Order } from '../types/orders';
import { orderStore } from '../services/orderStore';
import CSVImport from './CSVImport';

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
}

const ITEMS_PER_PAGE = 10;

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    const handleOrders = (allOrders: Order[]) => {
      const activeOrders = allOrders
        .filter(order => order.status !== 'completed')
        .sort((a, b) => {
          // Sort by status (pending first, then in_progress)
          if (a.status === 'pending' && b.status === 'in_progress') return -1;
          if (a.status === 'in_progress' && b.status === 'pending') return 1;
          // Then sort by creation date
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });
      setOrders(activeOrders);
    };

    const unsubscribe = orderStore.subscribe(handleOrders);
    return () => unsubscribe();
  }, []);

  const handleImport = (newOrders: Order[]) => {
    orderStore.setOrders([...orders, ...newOrders]);
    setImportDialogOpen(false);
  };

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const currentOrders = orders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Active Orders
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          size="small"
          onClick={() => setImportDialogOpen(true)}
        >
          Import CSV
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No active orders
        </Typography>
      ) : (
        <>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {currentOrders.map((order, index) => (
              <React.Fragment key={order.orderId}>
                <ListItem
                  button
                  selected={selectedOrder?.orderId === order.orderId}
                  onClick={() => onOrderSelect(order)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          Order #{order.orderId}
                        </Typography>
                        <Chip
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status)}
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
                          Created: {new Date(order.createdAt || '').toLocaleString()}
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

      <CSVImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />
    </Box>
  );
};

export default OrderList; 