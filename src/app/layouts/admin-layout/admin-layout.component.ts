import { Component, OnInit } from '@angular/core';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { RouteInfo } from 'src/app/models/routes.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  adminRoutes:RouteInfo[] = [];

  constructor() { }

  ngOnInit() {
    this.adminRoutes = [
      { path: 'dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
      { path: 'user-profile', title: 'User Profile', icon: 'ni-single-02 text-yellow', class: '' },
      { path: 'tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '' },
      { path: 'icons', title: 'Icons', icon: 'ni-planet text-blue', class: '' },
      { path: 'maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '' }
    ];
  }

}
