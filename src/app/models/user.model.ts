export interface User {
  idNo: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  id?: string;
  isActive: boolean;
  // notifications?: UserNotification[];
  // Add other properties as needed
}

// export interface UserNotification {
//   id?: string;
//   transactionId: string;
//   orderId?: string;
//   type: string;
//   title: string;
//   message: string;
//   redirectTo: string;
//   read: boolean;
//   timestamp: string;
// }
