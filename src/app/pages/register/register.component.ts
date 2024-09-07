import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  user = {
    idNo: '',
    password: '',
    name: '',
    email: '',
    phone: ''
  };
  errorMessage = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  constructor(private firestoreService: FirestoreService) {
   }

  ngOnInit() {
  }

  register() {
    if (this.validateForm()) {
      this.firestoreService.addUser(this.user)
        .then(() => {
          // Registration successful
          console.log('User registered successfully');
          this.user = { idNo: '', password: '', name: '', email: '', phone: '' }; // Clear form
        })
        .catch((error) => {
          // Handle error
          console.error('Error registering user:', error);
          this.errorMessage = 'Registration failed';
        });
    } else {
      this.errorMessage = 'Please fill in all fields';
    }
  }

  validateForm(): boolean {
    return Object.values(this.user).every(field => field.trim() !== '');
  }

  onSubmit(form: NgForm){
    if (this.user.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'Passwords do not match';
    } else {
      this.passwordMismatch = false;
      if (form.valid) {
        this.register()
      }
    }
  }

}
