import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const userRole = this.authService.getUserRole(); // Retrieve user role from AuthService

    if (route.routeConfig?.path === 'student' && userRole === 'student') {
      return true; // Allow access for students
    }

    // If the user is not a student, redirect them to their respective dashboard
    if (userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (userRole === 'custodian') {
      this.router.navigate(['/custodian']);
    } else {
      this.router.navigate(['/login']); // Redirect to login if no valid role is found
    }

    return false; // Block access if user is not authorized
  }
  
}
