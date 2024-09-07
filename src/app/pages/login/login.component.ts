import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Firestore service
import { Router } from '@angular/router'; // For navigation

interface User {
  idNo: string;
  password: string;
  // Add other fields as needed
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  idNo: string = ''; // ID number input field
  password: string = ''; // Password input field
  errorMessage: string = ''; // Error message field

  constructor(
    private firestore: AngularFirestore, // Firestore service injection
    private router: Router // Router service injection
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  login() {
    // Fetch the user by idNo from Firestore
    this.firestore.collection('Users', ref => ref.where('idNo', '==', this.idNo))
      .get()
      .subscribe({
        next: (snapshot) => {
          if (!snapshot.empty) {
            const user = snapshot.docs[0].data() as User; 

            if (user.password === this.password) {
              this.errorMessage = ''; 
              this.router.navigate(['/dashboard']); 
            } else {
              
              this.errorMessage = 'Invalid password';
            }
          } else {
            
            this.errorMessage = 'User not found';
          }
        },
        error: (error) => {
          console.error("Error during login:", error);
          this.errorMessage = 'Login failed';
        }
      });
  }
}
