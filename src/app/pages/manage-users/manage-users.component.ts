import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ToastComponent } from "src/app/components/modal/toast/toast.component";
import { ToastService } from "src/app/components/modal/toast/toast.service";
import { FirestoreService } from "src/app/services/firestore.service";

@Component({
  selector: "app-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrl: "./manage-users.component.scss",
})
export class ManageUsersComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  userRoles: string[] = ["admin", "student", "custodian", "accountant"];

  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(
    private firestoreService: FirestoreService,
    private toastService: ToastService
  ) {
    firestoreService.collectionName = "Users";
  }

  ngOnInit(): void {
    this.firestoreService.getRecords().subscribe(
      (dbUsers) => {
        this.users = dbUsers; // Assuming dbUsers is an array
        console.log(this.users);
      },
      (error) => {
        console.error("Error fetching users: ", error); // Handle error
      }
    );
  }

  ngAfterViewInit() {
    this.toastService.registerToast(this.toastComponent);
  }

  onRoleChange(user: any, newValue: string): void {
    user.role = newValue;
  }

  onClickAction(user: any, isActive: boolean): void {
    user.isActive = !isActive;
  }

  getActionButton(isUserActive: boolean): string {
    return isUserActive ? "Deactivate" : "Activate";
  }

  async saveAllUsers(): Promise<void> {
    try {
      console.log(this.users);
      await this.firestoreService.updateRecords(this.users); // Pass the users array
      this.toastService.showToast("Users successfully updated", "success");
    } catch (error) {
      this.toastService.showToast("Update failed", "error");
    }
  }
}
