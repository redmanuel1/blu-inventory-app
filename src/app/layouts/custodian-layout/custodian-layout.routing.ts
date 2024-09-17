import { Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { ProductsComponent } from 'src/app/pages/custodian/products/products.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';

export const CustodianLayoutRoutes: Routes = [
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'orders',      component: DashboardComponent },
  { path: 'transactions',   component: UserProfileComponent },
  { path: 'products',   component: ProductsComponent },
  

];