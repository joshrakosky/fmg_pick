import { Order } from '../types/orders';

// Broadcast channel for cross-tab communication
const orderChannel = new BroadcastChannel('order-updates');

export type OrderStatus = 'pending' | 'in_progress' | 'completed';

class OrderStore {
  private static instance: OrderStore;
  private orders: Order[] = [];
  private listeners: ((orders: Order[]) => void)[] = [];

  private constructor() {
    // Load initial orders from localStorage
    this.loadOrders();

    // Listen for updates from other tabs/windows
    orderChannel.onmessage = (event) => {
      if (event.data.type === 'orders-updated') {
        this.loadOrders();
      }
    };

    // Refresh orders when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.loadOrders();
      }
    });
  }

  static getInstance(): OrderStore {
    if (!OrderStore.instance) {
      OrderStore.instance = new OrderStore();
    }
    return OrderStore.instance;
  }

  private loadOrders() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      this.orders = JSON.parse(storedOrders);
      this.notifyListeners();
    }
  }

  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
    orderChannel.postMessage({ type: 'orders-updated' });
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.orders));
  }

  subscribe(listener: (orders: Order[]) => void) {
    this.listeners.push(listener);
    listener(this.orders);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getOrders(): Order[] {
    return this.orders;
  }

  setOrders(orders: Order[]) {
    this.orders = orders;
    this.saveOrders();
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = status;
      if (status === 'completed') {
        order.completedAt = new Date().toISOString();
      }
      this.saveOrders();
    }
  }

  refreshOrders() {
    this.loadOrders();
  }
}

export const orderStore = OrderStore.getInstance(); 