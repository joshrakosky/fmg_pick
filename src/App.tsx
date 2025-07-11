import React, { useState } from 'react';
import OrderList from './components/OrderList';
import PickingInterface from './components/PickingInterface';
import CompletedOrders from './components/CompletedOrders';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  IconButton,
  Drawer,
  Badge,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Order } from './types/orders';
import { orderStore } from './services/orderStore';

const App: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const [completedCount, setCompletedCount] = useState(0);

  // Subscribe to order updates to get completed count
  React.useEffect(() => {
    const updateCompletedCount = (orders: Order[]) => {
      const completed = orders.filter(order => order.status === 'completed').length;
      setCompletedCount(completed);
    };

    // Initial count
    updateCompletedCount(orderStore.getOrders());

    // Subscribe to updates
    const unsubscribe = orderStore.subscribe(updateCompletedCount);
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ mb: 2 }}>
          <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                VBS FMG Picking System
              </Typography>
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

        <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            <Box sx={{ flex: '0 0 40%', overflow: 'auto' }}>
              <OrderList
                selectedOrder={selectedOrder}
                onOrderSelect={setSelectedOrder}
              />
            </Box>
            <Box sx={{ flex: '0 0 60%' }}>
              <PickingInterface
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
              />
            </Box>
          </Box>
        </Container>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 350, p: 2 }}>
            <CompletedOrders onClose={() => setDrawerOpen(false)} />
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default App; 