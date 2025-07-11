import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Order, OrderItem } from '../types/orders';
import Papa from 'papaparse';

interface CSVImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (orders: Order[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ open, onClose, onImport }) => {
  const [previewData, setPreviewData] = useState<Order[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (rows.length === 0) return;

        // Group rows by order ID (ProStore Order #)
        const orderGroups: { [key: string]: any[] } = {};
        rows.forEach(row => {
          const orderId = row['ProStore Order #'];
          if (orderId) {
            if (!orderGroups[orderId]) {
              orderGroups[orderId] = [];
            }
            orderGroups[orderId].push(row);
          }
        });

        // Convert to Order objects
        const orders: Order[] = Object.keys(orderGroups).map(orderId => {
          const orderRows = orderGroups[orderId];
          const firstRow = orderRows[0];

          // Extract color from Line Note if present
          const extractColorAndSize = (lineNote: string) => {
            const colorMatch = lineNote.match(/Color: ([^,]+)/i);
            const sizeMatch = lineNote.match(/Size: ([^,]+)/i);
            return {
              color: colorMatch ? colorMatch[1].trim() : undefined,
              size: sizeMatch ? sizeMatch[1].trim() : undefined,
              note: lineNote.replace(/Color: [^,]+,?/i, '').replace(/Size: [^,]+,?/i, '').trim()
            };
          };

          const items: OrderItem[] = orderRows
            .filter(row => row['Product Name'])
            .map(row => {
              const { color, size, note } = extractColorAndSize(row['Line Note'] || '');
              const itemId = row['Customer Item #'] || row['Product Name'];
              return {
                id: itemId,
                name: row['Product Name'],
                sku: row['Customer Item #'] || itemId,
                quantity: parseInt(row['Quantity'] || '1', 10),
                color,
                size,
                lineNote: note || undefined
              };
            });

          return {
            orderId,
            customer: {
              name: firstRow['Ship Name'] || '',
              email: firstRow['Contact Email'] || '',
              contact: firstRow['Customer Contact'] || '',
              address: {
                street: firstRow['Ship Street 1'] || '',  // Changed from street1 to street
                street2: firstRow['Ship Street 2'] || '',
                city: firstRow['City'] || '',
                state: firstRow['State'] || '',
                postal: firstRow['Postal'] || ''
              }
            },
            shipAttention: firstRow['Ship Attention'] || '',
            items,
            status: 'pending' as const,
            createdAt: firstRow['Created Date'] || new Date().toISOString()
          };
        });

        setPreviewData(orders);
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Orders from CSV</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="contained" component="span">
              Choose CSV File
            </Button>
          </label>
        </Box>

        {previewData.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Preview ({previewData.length} orders)
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{order.customer.address.city}, {order.customer.address.state}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onImport(previewData)}
              >
                Import Orders
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVImport; 