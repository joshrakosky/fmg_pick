import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Order, OrderItem } from '../types/orders';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CSVImportProps {
  onImport: (orders: Order[]) => void;
  onClose: () => void;
  open: boolean;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  Created: string;
  'D.ProStore': string;
  'Ship Nam': string;
  'Customer Contact': string;
  'E': string;
  'Ship Atten': string;
  'Ship Stree': string;
  'Ship Stree City': string;
  'State': string;
  'Postal': string;
  'Product N': string;
  'Customer': string;
  'Line Note': string;
  'Quantity': string;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImport, onClose, open }) => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    Created: '',
    'D.ProStore': '',
    'Ship Nam': '',
    'Customer Contact': '',
    'E': '',
    'Ship Atten': '',
    'Ship Stree': '',
    'Ship Stree City': '',
    'State': '',
    'Postal': '',
    'Product N': '',
    'Customer': '',
    'Line Note': '',
    'Quantity': ''
  });
  const [parsedOrders, setParsedOrders] = useState<Order[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          setIsLoading(false);
          return;
        }

        const data = results.data as CSVRow[];
        if (data.length === 0) {
          setError('CSV file is empty');
          setIsLoading(false);
          return;
        }

        const headers = Object.keys(data[0] || {});
        setCsvHeaders(headers);
        setCsvData(data);
        setStep('mapping');
        setIsLoading(false);
      },
      header: true,
      skipEmptyLines: true,
      error: (error) => {
        setError('Error reading file: ' + error.message);
        setIsLoading(false);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileUpload(file);
    } else {
      setError('Please upload a CSV file');
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processData = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Group rows by order ID to handle multiple items per order
      const orderGroups: { [orderId: string]: CSVRow[] } = {};
      
      csvData.forEach(row => {
        const orderId = row[columnMapping['D.ProStore']]; // Use D.ProStore as order ID
        if (!orderId) return;
        
        if (!orderGroups[orderId]) {
          orderGroups[orderId] = [];
        }
        orderGroups[orderId].push(row);
      });

      const orders: Order[] = Object.keys(orderGroups).map(orderId => {
        const orderRows = orderGroups[orderId];
        const firstRow = orderRows[0];

        const items: OrderItem[] = orderRows
          .filter(row => row[columnMapping['Product N']]) // Only include rows with products
          .map(row => ({
            sku: row[columnMapping['Product N']] || '',
            productName: row[columnMapping['Product N']] || '', // Using Product N as both SKU and name for now
            quantity: parseInt(row[columnMapping.Quantity] || '1', 10),
            lineNote: row[columnMapping['Line Note']] || ''
          }));

        return {
          orderId,
          customer: {
            name: firstRow[columnMapping['Ship Nam']] || '',
            email: firstRow[columnMapping['Customer Contact']] || '',
            contact: firstRow[columnMapping['Customer Contact']] || '',
            address: {
              street1: firstRow[columnMapping['Ship Stree']] || '',
              city: firstRow[columnMapping['Ship Stree City']] || '',
              state: firstRow[columnMapping.State] || '',
              postal: firstRow[columnMapping.Postal] || ''
            }
          },
          shipAttention: firstRow[columnMapping['Ship Atten']] || '',
          items,
          status: 'pending' as const,
          createdAt: firstRow[columnMapping.Created] || new Date().toISOString()
        };
      });

      setParsedOrders(orders);
      setStep('preview');
    } catch (error) {
      setError('Error processing data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    onImport(parsedOrders);
    onClose();
  };

  const handleClose = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({
      Created: '',
      'D.ProStore': '',
      'Ship Nam': '',
      'Customer Contact': '',
      'E': '',
      'Ship Atten': '',
      'Ship Stree': '',
      'Ship Stree City': '',
      'State': '',
      'Postal': '',
      'Product N': '',
      'Customer': '',
      'Line Note': '',
      'Quantity': ''
    });
    setParsedOrders([]);
    setStep('upload');
    setError(null);
    onClose();
  };

  const requiredFields = ['D.ProStore', 'Ship Nam', 'Customer Contact', 'Product N', 'Quantity'];
  const isValidMapping = requiredFields.every(field => 
    columnMapping[field as keyof ColumnMapping] !== ''
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Import Orders from CSV
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Step {step === 'upload' ? 1 : step === 'mapping' ? 2 : 3} of 3
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'upload' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Export your orders from Excel as CSV and upload here. The file should contain order details with one row per item.
            </Typography>
            
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed #ccc',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag & Drop CSV File Here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to select file
              </Typography>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-upload">
                <Button variant="outlined" component="span">
                  Select CSV File
                </Button>
              </label>
            </Paper>
          </Box>
        )}

        {step === 'mapping' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map CSV Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Match your Excel columns to the required order fields. 
              <Chip label="Required" color="error" size="small" sx={{ mx: 1 }} />
              fields must be mapped.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              {Object.entries({
                'D.ProStore': 'Order ID',
                'Ship Nam': 'Customer Name',
                'Customer Contact': 'Customer Contact',
                'Ship Stree': 'Street Address',
                'Ship Stree City': 'City',
                'State': 'State',
                'Postal': 'ZIP Code',
                'Product N': 'Product ID/Name',
                'Line Note': 'Line Note',
                'Quantity': 'Quantity',
                'Created': 'Created Date',
                'Ship Atten': 'Ship Attention'
              }).map(([key, label]) => (
                <FormControl key={key} size="small" fullWidth>
                  <InputLabel>
                    {label}
                    {requiredFields.includes(key) && (
                      <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />
                    )}
                  </InputLabel>
                  <Select
                    value={columnMapping[key as keyof ColumnMapping]}
                    onChange={(e) => handleMappingChange(key as keyof ColumnMapping, e.target.value)}
                  >
                    <MenuItem value="">-- Select Column --</MenuItem>
                    {csvHeaders.map(header => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>

            {csvData.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview (first 3 rows):
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {csvHeaders.map(header => (
                          <TableCell key={header}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvData.slice(0, 3).map((row, index) => (
                        <TableRow key={index}>
                          {csvHeaders.map(header => (
                            <TableCell key={header}>{row[header]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {step === 'preview' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview Import
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Found {parsedOrders.length} orders with {parsedOrders.reduce((sum, order) => sum + order.items.length, 0)} total items.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
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
                  {parsedOrders.slice(0, 10).map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{order.customer.address.city}, {order.customer.address.state}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {parsedOrders.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ... and {parsedOrders.length - 10} more orders
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        
        {step === 'mapping' && (
          <Button 
            onClick={processData} 
            variant="contained" 
            disabled={!isValidMapping || isLoading}
          >
            Process Data
          </Button>
        )}
        
        {step === 'preview' && (
          <Button onClick={handleImport} variant="contained" startIcon={<CheckCircleIcon />}>
            Import {parsedOrders.length} Orders
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImport; 