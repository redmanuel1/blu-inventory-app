import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router){
    
  }
  
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // If the user is logged in, redirect them to their dashboard
      const role = this.authService.getUserRole();
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'student') {
        this.router.navigate(['/student/dashboard']);
      } else if (role === 'custodian') {
        this.router.navigate(['/custodian/dashboard']);
      }
      return false; // Prevent navigation to the login page
    }
    return true; // Allow navigation to the login page if not logged in
  }
  
}
