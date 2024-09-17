import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
// import { User } from './user.model'; // Import the User interface
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private firestore: AngularFirestore) {}

  // Method to login the user
  login(idNo: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('Users', ref => ref.where('idNo', '==', idNo))
        .get()
        .subscribe({
          next: (snapshot) => {
            debugger;
            if (!snapshot.empty) {
              const user = snapshot.docs[0].data() as User;
              if (user.password === password) {
                this.userSubject.next(user);
                this.saveUserToLocalStorage(user);
                debugger;
                this.user$ = this.userSubject.asObservable();
                resolve(true); // Login successful
              } else {
                resolve(false); // Incorrect password
              }
            } else {
              resolve(false); // User not found
            }
          },
          error: (error) => {
            console.error("Error during login:", error);
            reject(false); // Login failed
          }
        });


        // .subscribe(snapshot => {
        //   if (!snapshot.empty) {
        //     const user = snapshot.docs[0].data() as User;
        //     if (user.password === password) {
        //       this.userSubject.next(user);
        //       this.saveUserToLocalStorage(user);
        //       debugger;
        //       this.user$ = this.userSubject.asObservable();
        //       resolve(true); // Login successful
        //     } else {
        //       resolve(false); // Incorrect password
        //     }
        //   } else {
        //     resolve(false); // User not found
        //   }
        // }, error => {
        //   console.error("Error during login:", error);
        //   reject(false); // Login failed
        // });
    });
  }
  
  getUserRole(): string | null {
    const user = this.userSubject.value || this.getUserFromLocalStorage();
    return user ? user.role || null : null;
  }

  private getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private saveUserToLocalStorage(user: User | null) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
  
  // Method to log out
  logout() {
    this.userSubject.next(null); // Clear user data
    this.saveUserToLocalStorage(null); // Remove user from localStorage
  }
}
