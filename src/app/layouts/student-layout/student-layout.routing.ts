import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentLayoutComponent } from './student-layout.component';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';

export const StudentLayoutRoutes: Routes = [
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'user-profile',   component: UserProfileComponent },

];