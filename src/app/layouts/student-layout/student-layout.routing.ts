import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { ProductsComponent } from 'src/app/pages/student/products/products.component';
import { OrderDetailsComponent } from 'src/app/pages/student/transactions/order-details/order-details.component';
import { TransactionsComponent } from 'src/app/pages/student/transactions/transactions.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';

export const StudentLayoutRoutes: Routes = [
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'user-profile',   component: UserProfileComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'transactions/:transactionId/order-details', component: OrderDetailsComponent},
  { path: 'products',   component: ProductsComponent },
];