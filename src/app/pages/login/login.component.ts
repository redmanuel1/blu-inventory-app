import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  idNo: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  async login() {
    try {
      // Call the login method and wait for it to complete
      const success = await this.authService.login(this.idNo, this.password);
      if (success) {
        // Retrieve the role after successful login
        const role = this.authService.getUserRole();
        console.log('User role:', role);
        // Redirect based on role
        if (role === 'custodian') {
          this.router.navigate(['admin/dashboard']); // Adjust as needed
        } else {
          this.router.navigate(['student/dashboard']); // Adjust as needed
        }
      } else {
        this.errorMessage = 'Login failed';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'An error occurred during login';
    }
  }
}
