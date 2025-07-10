import React, { useState } from 'react';
import { Order } from './types/orders';
import OrderList from './components/OrderList';
import PickingInterface from './components/PickingInterface';
import TestOrders from './components/TestOrders';
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
  Drawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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

  const handleOrderSelect = (order: Order | null) => {
    setSelectedOrder(order);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const OrderListComponent = (
    <OrderList 
      selectedOrder={selectedOrder}
      onOrderSelect={handleOrderSelect}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ mb: 2 }}>
          <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div">
                VBS FMG Picking System
              </Typography>
            </Box>
          </Container>
        </AppBar>

        <Container sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {isMobile ? (
            <>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: '80%',
                    maxWidth: 360,
                    boxSizing: 'border-box',
                  },
                }}
              >
                {OrderListComponent}
              </Drawer>
              <Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}>
                {selectedOrder ? (
                  <PickingInterface 
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                  />
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                    Select an order from the menu to start picking
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ width: '40%', bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}>
                {OrderListComponent}
              </Box>
              <Box sx={{ width: '60%', bgcolor: 'white', borderRadius: 1, p: 2, boxShadow: 1 }}>
                <PickingInterface 
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>
      <TestOrders />
    </ThemeProvider>
  );
}

export default App; 