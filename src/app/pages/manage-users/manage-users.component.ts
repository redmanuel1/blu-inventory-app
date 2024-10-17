import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
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
    private toastService: ToastService,
    private spinnerService: NgxSpinnerService
  ) {
    firestoreService.collectionName = "Users";
  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.firestoreService.getRecords().subscribe({
      next: (dbUsers) => {
        this.users = dbUsers; // Assuming dbUsers is an array
        console.log(this.users);
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastService.showToast(`Error fetching users: ${error}`, "error");
        console.error("Error fetching users: ", error); // Handle error
        this.spinnerService.hide();
      },
    });
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
    this.spinnerService.show();
    setTimeout(async () => {
      await this.firestoreService
        .updateRecords(this.users)
        .then((result) => {
          console.log(this.users);
          this.toastService.showToast("Users successfully updated", "success");
          this.spinnerService.hide();
        }) // Pass the users array
        .catch((error) => {
          this.toastService.showToast("Update failed", "error");
          this.spinnerService.hide();
        });
    }, 100);
  }
}
