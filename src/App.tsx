import React, { useState } from 'react';
import { Order } from './types/orders';
import OrderList from './components/OrderList';
import PickingInterface from './components/PickingInterface';
import CompletedOrders from './components/CompletedOrders';
import AdminControls from './components/AdminControls';
import { 
  AppBar, 
  Box, 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  Typography, 
  createTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { orderStore } from './services/orderStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [completedCount, setCompletedCount] = useState(0);

  // Subscribe to order updates to get completed count
  React.useEffect(() => {
    const updateCompletedCount = (orders: Order[]) => {
      const completed = orders.filter(order => order.status === 'completed').length;
      setCompletedCount(completed);
    };

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
                  <CheckCircleIcon />
                </Badge>
              </IconButton>
            </Box>
          </Container>
        </AppBar>

        <Container sx={{ flex: 1, display: 'flex', gap: 2 }}>
          <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
            <Box sx={{ width: '40%', bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
              <OrderList 
                selectedOrder={selectedOrder}
                onOrderSelect={setSelectedOrder}
              />
            </Box>
            <Box sx={{ width: '60%', bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}>
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
          sx={{
            '& .MuiDrawer-paper': {
              width: '90%',
              maxWidth: 600,
              boxSizing: 'border-box',
            },
          }}
        >
          <CompletedOrders onClose={() => setDrawerOpen(false)} />
        </Drawer>

        <AdminControls />
      </Box>
    </ThemeProvider>
  );
}

export default App; 