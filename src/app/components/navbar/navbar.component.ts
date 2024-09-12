import { Component, OnInit, ElementRef, Input } from '@angular/core';
// import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RouteInfo } from 'src/app/models/routes.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // @Input() routes: RouteInfo[];

  public focus;
  public listTitles: any[];
  public location: Location;
  constructor(location: Location,  private element: ElementRef, private router: Router, private authService: AuthService) {
    this.location = location;
  }

  ngOnInit() {
    // if (this.routes) {
    //   this.listTitles = this.routes.filter(listTitle => listTitle);
    // } else {
    //   this.listTitles = ROUTES.filter(listTitle => listTitle);
    // }
    
  }
  getTitle(){
    const titlee = this.location.prepareExternalUrl(this.location.path()); //eg. /student/dashboard
    const titleArr = titlee.split("/");
    let title = "Dashboard";
    if (titleArr.length > 0) {
      title = titleArr.pop();
    }
    return title; // default  is Dashboard
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/auth/login'])
  }

}
