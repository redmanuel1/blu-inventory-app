import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  user = {
    idNo: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };
  errorMessage = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  constructor(private firestoreService: FirestoreService, private toastr: ToastrService) {
   }

  ngOnInit() {
  }

  register() {
    if (this.validateForm()) {
      this.firestoreService.addUser(this.user)
        .then(() => {
          // Registration successful
          this.toastr.success("User registered successfully");
          console.log('User registered successfully');
          this.user = { idNo: '', password: '', firstName: '', lastName: '', email: '', phone: '' }; // Clear form
          this.confirmPassword = '';
        })
        .catch((error) => {
          // Handle error
          console.error('Error registering user:', error);
          this.errorMessage = 'Registration failed';
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

  onSubmit(form: NgForm){
    console.log(form);
    if (this.user.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'Passwords do not match';
      this.toastr.error(this.errorMessage);
    } else {
      this.passwordMismatch = false;
      if (form.valid) {
        this.register()
      }
    }
  }

}
