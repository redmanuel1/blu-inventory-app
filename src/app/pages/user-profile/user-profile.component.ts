import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  public user: any;
  constructor(private firestoreService: FirestoreService, private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => this.user = user);
    console.log(this.user);
  }

}
