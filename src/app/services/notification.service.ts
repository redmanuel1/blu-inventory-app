import { Injectable } from "@angular/core";
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
  async addNotification(
    usersToNotifyArr: User[],
    type:
      | "studentpayment"
      | "accountantrejectpayment"
      | "accountantacceptpaymentstudent"
      | "accountantacceptpaymentcustodian"
      | "custodianconfirmpickup",
    transactionId: string,
    orderId: string = null
  ): Promise<void> {
    let notification = this.getNotificationByType(type, transactionId, orderId);
    debugger;
    for (let user of usersToNotifyArr) {
      this.firestore.collectionName = "Users";
      this.firestore.subCollectionName = "Notifications";

      let subscription = this.firestore
        .getSRecordByDocIdWithSubCollections(user.id)
        .subscribe({
          next: async (result) => {
            if (result) {
              let hasOldNotification = false;
              let isDuplicate = false;
              // update the old notification if it is unread
              for (let userNotification of result) {
                if (
                  userNotification.transactionId ==
                    notification.transactionId &&
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
            subscription.unsubscribe();
          },
          error: (error) => {
            subscription.unsubscribe();
          },
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
    // default notification
    notification = {
      transactionId: `${transactionId}`,
      type: type,
      title: ``,
      message: ``,
      read: false,
      timestamp: new Date(Date.now()).toISOString(),
      redirectTo: ``,
    };
    switch (type) {
      case "studentpayment":
        notification.title = `Student has uploaded payment details`;
        notification.message = `${userFullName} has uploaded their payment details.`;
        notification.redirectTo = this.getRedirectLinkByType(
          "accountant",
          transactionId
        );
        break;
      case "accountantrejectpayment":
        notification.title = `Payment Declined`;
        notification.message = `${userFullName} has declined the payment.`;
        notification.redirectTo = this.getRedirectLinkByType(
          "student",
          transactionId
        );
        break;
      case "accountantacceptpaymentstudent":
        notification.title = `Payment Approved`;
        notification.message = `${userFullName} has approved the payment.`;
        notification.redirectTo = this.getRedirectLinkByType(
          "student",
          transactionId
        );
        break;
      case "accountantacceptpaymentcustodian":
        notification.title = `Payment Approved`;
        notification.message = `${userFullName} has approved the payment.`;
        notification.redirectTo = this.getRedirectLinkByType(
          "custodian",
          transactionId
        );
        break;
      case "custodianconfirmpickup":
        notification.title = `Ready for Pickup`;
        notification.message = `${userFullName} has confirmed that your order is ready for pick up.`;
        notification.redirectTo = this.getRedirectLinkByType(
          "student",
          transactionId
        );
        break;
      default:
        notification = null;
    }
    return notification;
  }

  private getRedirectLinkByType(
    type: "accountant" | "student" | "custodian",
    transactionId: string
  ): string {
    let url = "";
    switch (type) {
      case "accountant":
        url = `/accountant/transactions/${transactionId}/order-confirmation`;
        break;
      case "student":
        url = `/student/transactions/${transactionId}/order-details`;
        break;
      case "custodian":
        url = `/custodian/orders/${transactionId}/order-pickup`;
        break;
      default:
        url = null;
    }
    return url;
  }
}
