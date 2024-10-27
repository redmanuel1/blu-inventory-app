import { Component, OnInit, output } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { UserNotification } from "src/app/models/user-notification";
import { User } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { FirestoreService } from "src/app/services/firestore.service";
import { NotificationService } from "src/app/services/notification.service";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrl: "./notification.component.scss",
})
export class NotificationComponent implements OnInit {
  public title: string;
  public message: string;
  public currentUser: User;
  public unreadCount: number = 0;
  public notificationsArr: any[] = [];
  public unReadNotificationArr: UserNotification[] = [];
  public unReadCountOutput = output<number>();
  private userId: string = "";
  constructor(
    private firestore: FirestoreService,
    private authService: AuthService,
    private router: Router
  ) {}
  // ngOnInit(): void {
  //   let userId = this.authService.getUserIdNo();
  //   this.firestore.collectionName = "Users";
  //   this.firestore.subCollectionName = "Notifications";
  //   this.firestore.getSRecordByDocIdWithSubCollections(userId).subscribe({
  //     next: (user: User[]) => {
  //       this.currentUser = user[0];
  //       if (this.currentUser.notifications) {
  //         this.notificationsArr = [];
  //         for (
  //           let index = 0;
  //           index < this.currentUser.notifications.length;
  //           index++
  //         ) {
  //           const element = this.currentUser.notifications[index];
  //           if (element.read == false) {
  //             const notificationWithIndex = {
  //               notification: element,
  //               index: index,
  //             };
  //             this.notificationsArr.push(notificationWithIndex);
  //           }
  //         }
  //         this.unreadCount = this.notificationsArr.length;
  //         this.unReadCount.emit(this.unreadCount);
  //       }
  //     },
  //   });
  // }
  ngOnInit(): void {
    this.userId = this.authService.getUserDocId();
    debugger;
    this.firestore.collectionName = "Users";
    this.firestore.subCollectionName = "Notifications";
    this.firestore.getSRecordByDocIdWithSubCollections(this.userId).subscribe({
      next: (resultArr: UserNotification[]) => {
        if (resultArr) {
          this.notificationsArr = resultArr;
          this.unReadNotificationArr = resultArr.filter(
            (notification) => notification.read === false
          );
          this.unreadCount = this.unReadNotificationArr.length;
          this.unReadCountOutput.emit(this.unreadCount);
        }
      },
    });
  }
  async markAsRead(id: string): Promise<void> {
    debugger;
    let notification = this.unReadNotificationArr.filter(
      (notification) => notification.id == id
    )[0];
    notification.read = true;
    this.firestore.collectionName = "Users";
    this.firestore.subCollectionName = "Notifications";
    await this.firestore.updateSubCollectionRecords(this.userId, [
      notification,
    ]);
    // this.currentUser.notifications[index].read = true;
    // this.firestore.collectionName = "Users";
    // await this.firestore.updateRecords([this.currentUser]).catch((error) => {
    //   console.log(error);
    // });
    // debugger;
    // console.log(this.currentUser.notifications[index].redirectTo);
    this.router.navigateByUrl(notification.redirectTo);
  }
}
