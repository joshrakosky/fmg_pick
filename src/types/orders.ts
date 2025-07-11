export interface CustomerAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  postal: string;
}

export interface Customer {
  name: string;
  email: string;
  contact: string;
  address: CustomerAddress;
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  color?: string;
  size?: string;
  lineNote?: string;
}

export interface Order {
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  shipAttention?: string;
}

export type CSVRow = { [key: string]: string };

// Helper function to validate order data
export function isValidOrder(order: Order): boolean {
  return (
    !!order.orderId &&
    !!order.customer.name &&
    !!order.customer.email &&
    !!order.customer.address.city &&
    !!order.customer.address.state &&
    !!order.customer.address.postal &&
    Array.isArray(order.items) &&
    order.items.length > 0
  );
} 