import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Chip, Typography, CircularProgress } from '@mui/material';
import { Order } from '../types/orders';
import ordersData from '../data/orders.json';
import CSVImport from './CSVImport';
import { orderStore } from '../services/orderStore';

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
}

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStartY, setRefreshStartY] = useState<number | null>(null);

  const handleOrders = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
  }, []);

  useEffect(() => {
    // Subscribe to order updates
    const unsubscribe = orderStore.subscribe(handleOrders);

    // Load initial orders if none exist
    if (orderStore.getOrders().length === 0) {
      // Transform the data to match our Order type
      const transformedOrders: Order[] = ordersData.orders.map(order => ({
        orderId: order.orderId,
        customer: {
          name: order.customer.name,
          email: order.customer.email || '',
          contact: order.customer.contact || order.customer.name,
          address: {
            street1: order.customer.address.street1,
            city: order.customer.address.city,
            state: order.customer.address.state,
            postal: order.customer.address.postal
          }
        },
        items: order.items.map(item => ({
          sku: item.sku,
          productName: item.productName,
          quantity: item.quantity,
          lineNote: ''
        })),
        shipAttention: order.shipAttention || '',
        status: 'pending',
        createdAt: order.createdAt || new Date().toISOString()
      }));
      orderStore.setOrders(transformedOrders);
    }

    return () => unsubscribe();
  }, [handleOrders]);

  const handleImport = (newOrders: Order[]) => {
    orderStore.setOrders([...orders, ...newOrders]);
    setImportDialogOpen(false);
  };

  const handleOrderSelect = (order: Order) => {
    // Update order status to in_progress when selected
    if (order.status === 'pending') {
      orderStore.updateOrderStatus(order.orderId, 'in_progress');
    }
    onOrderSelect(order);
  };

  // Pull to refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setRefreshStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshStartY === null || isRefreshing) return;

    const pullDistance = e.touches[0].clientY - refreshStartY;
    if (pullDistance > 100 && window.scrollY === 0) {
      setIsRefreshing(true);
      orderStore.refreshOrders();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleTouchEnd = () => {
    setRefreshStartY(null);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box 
      sx={{ p: 3 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Orders</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setImportDialogOpen(true)}
        >
          Import CSV
        </Button>
      </Box>

      {isRefreshing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box sx={{ display: 'grid', gap: 2 }}>
        {orders.map(order => (
          <Box
            key={order.orderId}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              },
              bgcolor: selectedOrder?.orderId === order.orderId ? 'action.selected' : 'inherit'
            }}
            onClick={() => handleOrderSelect(order)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">
                Order #{order.orderId}
              </Typography>
              <Chip
                label={order.status}
                size="small"
                color={getStatusColor(order.status)}
              />
            </Box>
            <Typography>
              Customer: {order.customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items: {order.items.length}
            </Typography>
            {order.completedAt && (
              <Typography variant="caption" color="text.secondary">
                Completed: {new Date(order.completedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <CSVImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />
    </Box>
  );
};

export default OrderList; 