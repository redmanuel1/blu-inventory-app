import { Component, OnInit, output } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { User, UserNotification } from "src/app/models/user.model";
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
  public unReadCount = output<number>();
  constructor(
    private firestore: FirestoreService,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    let userId = this.authService.getUserIdNo();
    this.firestore.collectionName = "Users";
    this.firestore.getRecordsByField("idNo", userId).subscribe({
      next: (user: User[]) => {
        this.currentUser = user[0];

        if (this.currentUser.notifications) {
          this.notificationsArr = [];
          for (
            let index = 0;
            index < this.currentUser.notifications.length;
            index++
          ) {
            const element = this.currentUser.notifications[index];
            if (element.read == false) {
              const notificationWithIndex = {
                notification: element,
                index: index,
              };
              this.notificationsArr.push(notificationWithIndex);
            }
          }
          this.unreadCount = this.notificationsArr.length;
          this.unReadCount.emit(this.unreadCount);
        }
      },
    });
  }
  async markAsRead(index: number): Promise<void> {
    this.currentUser.notifications[index].read = true;
    this.firestore.collectionName = "Users";
    await this.firestore.updateRecords([this.currentUser]).catch((error) => {
      console.log(error);
    });
    debugger;
    console.log(this.currentUser.notifications[index].redirectTo);
    this.router.navigateByUrl(this.currentUser.notifications[index].redirectTo);
  }
}
