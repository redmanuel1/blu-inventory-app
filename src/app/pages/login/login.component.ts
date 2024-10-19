import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthService } from "src/app/services/auth.service";
import { NavigationService } from "src/app/services/navigation.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  idNo: string = "";
  password: string = "";
  errorMessage: string = "";

  constructor(
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
  ) {}

  ngOnInit() {}

  async login() {
    // this.spinnerService.show();
    // try {
    //   // Call the login method and wait for it to complete
    //   const message = await this.authService.login(this.idNo, this.password);
    //   if (message.toLowerCase() === "success") {
    //     // Retrieve the role after successful login
    //     const role = this.authService.getUserRole();
    //     console.log("User role:", role);
    //     // Redirect based on role
    //     this.navigationService.redirectBasedOnRole(role);
    //   } else {
    //     this.errorMessage = message;
    //   }
    //   this.spinnerService.hide();
    // } catch (error) {
    //   console.error("Login error:", error);
    //   this.errorMessage = "An error occurred during login";
    //   this.spinnerService.hide();
    // }
  }

  private redirectBasedOnRole(role: string | null) {
    switch (role) {
      case "admin":
        this.router.navigate(["/admin/dashboard"]);
        break;
      case "student":
        this.router.navigate(["/student/products"]);
        break;
      case "custodian":
        this.router.navigate(["/custodian/dashboard"]);
        break;
      default:
        this.router.navigate(["/auth/login"]);
    }
  }
}
