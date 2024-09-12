import { Component, OnInit } from '@angular/core';
import { RouteInfo } from 'src/app/models/routes.model';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss']
})
export class StudentLayoutComponent implements OnInit {
  studentRoutes: RouteInfo[] = []

  constructor() { }

  ngOnInit() {
    this.studentRoutes = [
      { path: 'dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
      { path: 'user-profile', title: 'User Profile', icon: 'ni-single-02 text-yellow', class: '' },
      { path: 'tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '' },
      { path: 'icons', title: 'Icons', icon: 'ni-planet text-blue', class: '' },
      { path: 'maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '' }
    ];
  }


}
