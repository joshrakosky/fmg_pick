import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  AppBar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Order } from './types/orders';
import OrderList from './components/OrderList';
import PickingInterface from './components/PickingInterface';
import CSVImport from './components/CSVImport';
import { orderStore } from './services/orderStore';

const App: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  useEffect(() => {
    const updateCompletedCount = (orders: Order[]) => {
      setCompletedCount(orders.filter(order => order.status === 'completed').length);
    };

    orderStore.subscribe(updateCompletedCount);
    return () => orderStore.unsubscribe(updateCompletedCount);
  }, []);

  const handleImport = (orders: Order[]) => {
    orders.forEach(order => orderStore.addOrder(order));
    setCsvDialogOpen(false);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ mb: 2 }}>
          <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                VBS FMG Picking System
              </Typography>
              <Button
                color="inherit"
                onClick={() => setCsvDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Import CSV
              </Button>
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ ml: 2 }}
              >
                <Badge badgeContent={completedCount} color="error">
                  <MenuIcon />
                </Badge>
              </IconButton>
            </Box>
          </Container>
        </AppBar>

        <Container sx={{ flex: 1, display: 'flex', gap: 2 }}>
          <Box sx={{ width: '40%' }}>
            <OrderList
              selectedOrder={selectedOrder}
              onOrderSelect={setSelectedOrder}
            />
          </Box>
          <Box sx={{ width: '60%' }}>
            <PickingInterface
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          </Box>
        </Container>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Completed Orders ({completedCount})
          </Typography>
          {/* Add completed orders list here */}
        </Box>
      </Drawer>

      <CSVImport
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onImport={handleImport}
      />
    </>
  );
};

export default App; 