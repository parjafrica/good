import { Notification } from '../types';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    this.notifications = [
      {
        id: '1',
        type: 'alert',
        title: 'High-Priority Match',
        message: 'New USAID funding call matches 95% with your Digital Literacy project proposal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false,
        actionUrl: '/donor-discovery'
      },
      {
        id: '2',
        type: 'deadline',
        title: 'Deadline Approaching',
        message: 'UNDP Climate Action call deadline is in 3 days. Current proposal completion: 78%.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        actionUrl: '/proposals'
      },
      {
        id: '3',
        type: 'success',
        title: 'Application Submitted',
        message: 'Your application to Gates Foundation has been successfully submitted.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        read: true,
        actionUrl: '/funding'
      },
      {
        id: '4',
        type: 'info',
        title: 'New Donor Added',
        message: 'Ford Foundation has been added to your matched donors list.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        actionUrl: '/donor-discovery'
      },
      {
        id: '5',
        type: 'alert',
        title: 'AI Analysis Complete',
        message: 'Your proposal "Education for All" has been analyzed. Score: 87/100',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        read: true,
        actionUrl: '/proposals'
      }
    ];
  }

  async getNotifications(): Promise<Notification[]> {
    await this.simulateNetworkDelay();
    return [...this.notifications];
  }

  async getUnreadCount(): Promise<number> {
    await this.simulateNetworkDelay(200);
    return this.notifications.filter(n => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    await this.simulateNetworkDelay();
    
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;
    
    notification.read = true;
    this.notifyListeners();
    return true;
  }

  async markAllAsRead(): Promise<boolean> {
    await this.simulateNetworkDelay();
    
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
    return true;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    await this.simulateNetworkDelay();
    
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    
    if (this.notifications.length < initialLength) {
      this.notifyListeners();
      return true;
    }
    
    return false;
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    await this.simulateNetworkDelay();
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const notifications = [...this.notifications];
    this.listeners.forEach(listener => listener(notifications));
  }

  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const notificationService = new NotificationService();