import { Order } from '../types/orders';

type OrderListener = (orders: Order[]) => void;

// Create a broadcast channel for cross-tab communication
const orderChannel = new BroadcastChannel('order-updates');

// Check if this is the first load
const isFirstLoad = !localStorage.getItem('app_initialized');
if (isFirstLoad) {
  localStorage.clear(); // Clear all data
  localStorage.setItem('app_initialized', 'true');
}

class OrderStore {
  private orders: Order[] = [];
  private listeners: OrderListener[] = [];

  constructor() {
    // Load initial data from localStorage
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
    }

    // Listen for changes from other tabs/windows
    orderChannel.onmessage = (event) => {
      if (event.data.type === 'orders-updated') {
        this.orders = event.data.orders;
        this.notifyListeners();
      }
    };

    // Update when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
          this.orders = JSON.parse(savedOrders);
          this.notifyListeners();
        }
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.orders));
  }

  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
    orderChannel.postMessage({ type: 'orders-updated', orders: this.orders });
    this.notifyListeners();
  }

  getOrders(): Order[] {
    return this.orders;
  }

  addOrder(order: Order) {
    this.orders.push(order);
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
    listener(this.orders); // Initial call
  }

  unsubscribe(listener: OrderListener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
}

export const orderStore = new OrderStore(); 