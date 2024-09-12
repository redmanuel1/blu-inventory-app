import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const userRole = this.authService.getUserRole();
    const routePath = route.routeConfig?.path;

    if (isLoggedIn) {
      // User is logged in
      if (routePath === 'auth/login') {
        // Redirect logged-in users away from the login page
        this.router.navigate([`/${userRole}/dashboard`]);
        return false; // Prevent further navigation
      }
      
      // Allow access to routes based on user role
      if (routePath === userRole || routePath === `${userRole}/dashboard` || routePath === '${userRole}/icons') {
        return true;
      }

      // Redirect to the respective dashboard if unauthorized
      // this.router.navigate([`/${userRole}/dashboard`]);
      return false; // Prevent access to the current route
    } else {
      // User is not logged in
      if (routePath !== 'auth/login') {
        // Redirect to the login page if not logged in and trying to access protected routes
        this.router.navigate(['/auth/login']);
        return false; // Prevent access to the current route
      }
      
      // Allow access to the login page
      return true;
    }
  }
}
