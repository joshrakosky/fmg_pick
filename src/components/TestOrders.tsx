import React from 'react';
import { Button, Box } from '@mui/material';
import { orderStore } from '../services/orderStore';

const TestOrders: React.FC = () => {
  const addSampleOrders = () => {
    const sampleOrders = [
      {
        orderId: "TEST-001",
        customer: {
          name: "Test Customer 1",
          email: "test1@example.com",
          contact: "Test Contact 1",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "TS",
            postal: "12345"
          }
        },
        items: [
          {
            id: "SKU001",
            name: "Test Product 1",
            sku: "SKU001",
            quantity: 2,
            lineNote: "Test note"
          },
          {
            id: "SKU002",
            name: "Test Product 2",
            sku: "SKU002",
            quantity: 1
          }
        ],
        shipAttention: "Test Attention",
        status: "pending" as const,
        createdAt: new Date().toISOString()
      },
      {
        orderId: "TEST-002",
        customer: {
          name: "Test Customer 2",
          email: "test2@example.com",
          contact: "Test Contact 2",
          address: {
            street: "456 Test Ave",
            city: "Test Town",
            state: "TS",
            postal: "67890"
          }
        },
        items: [
          {
            id: "SKU003",
            name: "Test Product 3",
            sku: "SKU003",
            quantity: 3
          }
        ],
        status: "pending" as const,
        createdAt: new Date().toISOString()
      }
    ];

    orderStore.setOrders(sampleOrders);
  };

  const clearOrders = () => {
    orderStore.setOrders([]);
    localStorage.clear();
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={addSampleOrders}
        size="small"
      >
        Add Test Orders
      </Button>
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={clearOrders}
        size="small"
      >
        Clear All
      </Button>
    </Box>
  );
};

export default TestOrders; 