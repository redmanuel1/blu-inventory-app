import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemComponent } from 'src/app/components/cards/item/item.component';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { ProductsComponent } from 'src/app/pages/student/products/products.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';

export const StudentLayoutRoutes: Routes = [
  { path: 'products',   component: ProductsComponent },
  { path: 'products/:code',   component: ItemComponent },
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'user-profile',   component: UserProfileComponent },
  
  

];