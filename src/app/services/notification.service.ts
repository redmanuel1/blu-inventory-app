import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "../models/user.model";
import { AuthService } from "./auth.service";
import { FirestoreService } from "./firestore.service";
import { UserNotification } from "../models/user-notification";

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

  // async addNotificationTest(
  //   usersToNotifyArr: User[],
  //   type: "studentpayment" | "error" | "info",
  //   transactionId: string,
  //   orderId: string = null
  // ): Promise<void> {
  //   let notification = this.getNotificationByType(type, transactionId, orderId);
  //   for (let user of usersToNotifyArr) {
  //     if (user.notifications) {
  //       let hasOldNotification = false;
  //       // update the old notification if it is unread
  //       for (let userNotification of user.notifications) {
  //         if (orderId) {
  //           if (
  //             (userNotification.transactionId == transactionId &&
  //               userNotification.orderId == orderId &&
  //               userNotification.type == type &&
  //               userNotification.read == false) ||
  //             (userNotification.transactionId == transactionId &&
  //               userNotification.type == type &&
  //               userNotification.read == false)
  //           ) {
  //             hasOldNotification = true;
  //             userNotification = notification;
  //             break;
  //           }
  //         }
  //       }
  //       // push the new notification
  //       if (!hasOldNotification) {
  //         user.notifications.push(notification);
  //       }
  //     } else {
  //       user.notifications = [notification]; // Initialize notifications if not defined
  //     }
  //   }
  //   this.firestore.collectionName = this.collectionName;
  //   return await this.firestore.updateRecords(usersToNotifyArr).catch((err) => {
  //     console.log(err);
  //   });
  // }

  async addNotification(
    usersToNotifyArr: User[],
    type: "studentpayment" | "error" | "info",
    transactionId: string,
    orderId: string = null
  ): Promise<void> {
    let notification = this.getNotificationByType(type, transactionId, orderId);
    for (let user of usersToNotifyArr) {
      this.firestore.collectionName = "Users";
      this.firestore.subCollectionName = "Notifications";
      this.firestore.getSRecordByDocIdWithSubCollections(user.id).subscribe({
        next: async (result) => {
          if (result) {
            let hasOldNotification = false;
            let isDuplicate = false;
            // update the old notification if it is unread
            for (let userNotification of result) {
              if (
                userNotification.transactionId == notification.transactionId &&
                userNotification.orderId == notification.orderId &&
                userNotification.type == notification.type &&
                userNotification.title == notification.title &&
                userNotification.message == notification.message &&
                userNotification.redirectTo == notification.redirectTo &&
                userNotification.read == notification.read &&
                userNotification.timestamp == notification.timestamp
              ) {
                isDuplicate = true;
                break;
              }
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
                // Get the Id from the notification
                notification.id = userNotification.id;
                this.firestore.collectionName = "Users";
                await this.firestore.updateSubCollectionRecords(user.id, [
                  notification,
                ]);
                break;
              }
            }
            // push the new notification
            if (!hasOldNotification && !isDuplicate) {
              this.firestore.collectionName = "Users";
              await this.firestore.addSubCollectionRecords(user.id, [
                notification,
              ]);
            }
          } else {
            this.firestore.collectionName = "Users";
            await this.firestore.addSubCollectionRecords(user.id, [
              notification,
            ]);
          }
        },
        error: (error) => {},
      });
    }
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
          redirectTo: `/accountant/transactions/${transactionId}/order-confirmation`,
        };
        break;
      default:
        notification = null;
    }
    return notification;
  }
}
