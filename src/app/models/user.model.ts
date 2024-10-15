export interface User {
  idNo: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  id?: string;
  notifications?: UserNotification[];
  // Add other properties as needed
}

export interface UserNotification {
  transactionId: string;
  orderId?: string;
  type: string;
  title: string;
  message: string;
  redirectTo: string;
  read: boolean;
  timestamp: string;
}
