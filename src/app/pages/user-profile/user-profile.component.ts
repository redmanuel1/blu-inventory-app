import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User;
  isChangePassword: boolean = false;
  confirmPassword: string = '';
  errorMessage: string = ''
  constructor(private firestoreService: FirestoreService, private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => this.user = user);
    // for testing
    this.user = JSON.parse(localStorage.getItem('user'));
    console.log(this.user);
  }

  saveProfile() {
    if (this.validateForm()) {
      this.firestoreService.updateUser(this.user)
        .then(() => {
          // Registration successful
          this.toastr.success("User profile updated");
          console.log('User profile updated');
          this.confirmPassword = '';
        })
        .catch((error) => {
          // Handle error
          console.error('Error updating user:', error);
          this.errorMessage = 'Update failed failed';
          this.toastr.error(this.errorMessage);
        });
    } else {
      this.errorMessage = 'Please fill in all fields';
      this.toastr.error(this.errorMessage);
    }
  }

  validateForm(): boolean {
    return Object.values(this.user).every(field => field.trim() !== '');
  }

  //#region Events
  onChangePassword(){
    this.isChangePassword = !this.isChangePassword;
    this.user.password = '';
    this.confirmPassword = '';
  }

  onSubmit(form: NgForm){    
    console.log("submitted");
    if ((this.user.password !== this.confirmPassword) && this.isChangePassword) {
      this.errorMessage = 'Passwords do not match';
      this.toastr.error(this.errorMessage);
    } else {
      if (form.valid) {
        this.saveProfile()
      }
    }
  }
  //#endregion

}
