export interface UserNotification {
  id?: string;
  transactionId: string;
  orderId?: string;
  type: string;
  title: string;
  message: string;
  redirectTo: string;
  read: boolean;
  timestamp: string;
}
