import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { FirestoreService } from "src/app/services/firestore.service";
import { NotificationService } from "src/app/services/notification.service";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [],
  templateUrl: "./notification.component.html",
  styleUrl: "./notification.component.scss",
})
export class NotificationComponent implements OnInit {
  public title: string;
  public message: string;
  // notifications$: Observable<any[]>;
  public currentUser: User;
  public unreadCount: number = 0;
  constructor(
    private firestore: FirestoreService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    firestore.collectionName = "Users";
  }
  ngOnInit(): void {
    this.firestore
      .getRecordsByField("userId", this.authService.getUserDocId)
      .subscribe({
        next: (user: User) => {
          this.currentUser = user;
          this.unreadCount = user.notifications.filter(
            (notification) => notification.read == false
          ).length;
        },
      });
  }
  markAsRead(index: number): void {
    this.currentUser.notifications[index].read = true;
  }
}
