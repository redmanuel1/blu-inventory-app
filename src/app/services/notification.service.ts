import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User, UserNotification } from "../models/user.model";
import { AuthService } from "./auth.service";
import { FirestoreService } from "./firestore.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private collectionName = "Users";
  private baseUrl: string;
  constructor(
    private firestore: FirestoreService,
    private authService: AuthService
  ) {
    this.firestore.collectionName = this.collectionName;
    this.baseUrl = window.location.origin;
  }

  async addNotification(
    usersToNotifyArr: User[],
    type: "studentpayment" | "error" | "info",
    transactionId: string,
    orderId: string = null
  ): Promise<void> {
    debugger;
    let notification = this.getNotificationByType(type, transactionId, orderId);
    for (let user of usersToNotifyArr) {
      debugger;
      if (user.notifications) {
        let hasOldNotification = false;
        // update the old notification if it is unread
        for (let userNotification of user.notifications) {
          if (orderId) {
            if (
              (userNotification.transactionId == transactionId &&
                userNotification.orderId == orderId &&
                userNotification.type == type &&
                userNotification.read == false) ||
              (userNotification.transactionId == transactionId &&
                userNotification.type == type &&
                userNotification.read == false)
            ) {
              hasOldNotification = true;
              userNotification = notification;
              break;
            }
          }
        }
        // push the new notification
        if (!hasOldNotification) {
          user.notifications.push(notification);
        }
      } else {
        user.notifications = [notification]; // Initialize notifications if not defined
      }
    }
    this.firestore.collectionName = this.collectionName;
    return await this.firestore.updateRecords(usersToNotifyArr).catch((err) => {
      console.log(err);
    });
  }
  private getNotificationByType(
    type: string,
    transactionId: string,
    orderId: string
  ): UserNotification {
    let notification: UserNotification;
    let userFullName: string = this.authService.getUserFullName();
    switch (type) {
      case "studentpayment":
        notification = {
          transactionId: `${transactionId}`,
          type: type,
          title: `Student has uploaded payment details`,
          message: `${userFullName} has uploaded their payment details. Kindly review it`,
          read: false,
          timestamp: new Date(Date.now()).toISOString(),
          redirectTo: `${this.baseUrl}/accountant/transactions/${transactionId}/order-confirmation`,
        };
        break;
      default:
        notification = null;
    }
    return notification;
  }
}
