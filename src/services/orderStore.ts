import { Order } from '../types/orders';

type OrderListener = (orders: Order[]) => void;

// Create a broadcast channel for cross-tab communication
const orderChannel = new BroadcastChannel('order-updates');

class OrderStore {
  private orders: Order[] = [];
  private listeners: OrderListener[] = [];

  constructor() {
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

  private loadOrders() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      this.orders = JSON.parse(storedOrders);
      this.notifyListeners();
    }
  }

  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
    // Notify other tabs/windows
    orderChannel.postMessage({ type: 'orders-updated' });
    this.notifyListeners();
  }

  getOrders(): Order[] {
    return this.orders;
  }

  setOrders(orders: Order[]) {
    this.orders = orders;
    this.saveOrders();
  }

  updateOrder(updatedOrder: Order) {
    const index = this.orders.findIndex(order => order.orderId === updatedOrder.orderId);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.saveOrders();
    }
  }

  subscribe(listener: OrderListener) {
    this.listeners.push(listener);
    // Immediately notify new listener of current state
    listener(this.orders);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.orders));
  }
}

export const orderStore = new OrderStore(); 