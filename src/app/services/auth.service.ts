import { User } from './../models/user.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private firestore: AngularFirestore) {
    // Initialize user data from localStorage if available
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Method to login the user
  login(idNo: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('Users', ref => ref.where('idNo', '==', idNo))
        .get()
        .subscribe(snapshot => {
          if (!snapshot.empty) {
            const user = snapshot.docs[0].data() as User;
            if (user.password === password) {

              // Store user in localStorage
              localStorage.setItem('authUser', JSON.stringify(user));

              this.userSubject.next(user);
              resolve(true); // Login successful
            } else {
              resolve(false); // Incorrect password
            }
          } else {
            resolve(false); // User not found
          }
        }, error => {
          console.error("Error during login:", error);
          reject(false); // Login failed
        });
    });
  }
  
  getUserRole(): string | null {
    const user = this.userSubject.value;
    return user ? user.role || null : null;
  }
  
  // Method to check if user is logged in
  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
  
  // Method to log out
  logout() {
    localStorage.removeItem('authUser'); // Clear user data from localStorage
    this.userSubject.next(null); // Clear user data
  }
}
