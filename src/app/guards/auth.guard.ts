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

    console.log('isLoggedIn:', isLoggedIn);
    console.log('userRole:', userRole);
    console.log('routePath:', routePath);

    if (isLoggedIn) {
      // Redirect logged-in users away from the login page
      if (routePath === 'auth/login') {
        this.router.navigate([`/${userRole}/dashboard`]);
        return false;
      }

      // Allow access to routes based on user role
      if (routePath === userRole || routePath === `${userRole}/dashboard` || routePath === `${userRole}/icons`) {
        return true;
      }

      // Redirect to the respective dashboard if unauthorized
      this.router.navigate([`/${userRole}/dashboard`]);
      return false;
    } else {
      // Redirect to the login page if not logged in and trying to access protected routes
      if (routePath !== 'auth/login') {
        this.router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }
  }
}
