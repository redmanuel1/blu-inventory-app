import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable } from "rxjs";
// import { User } from './user.model'; // Import the User interface
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private firestore: AngularFirestore) {}

  // Method to login the user
  login(idNo: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.firestore
        .collection("Users", (ref) => ref.where("idNo", "==", idNo))
        .get()
        .subscribe({
          next: (snapshot) => {
            console.log("test");
            debugger;
            if (!snapshot.empty) {
              const user = snapshot.docs[0].data() as User;
              user.id = snapshot.docs[0].id;
              if (user.password === password && user.isActive) {
                this.userSubject.next(user);
                this.saveUserToLocalStorage(user);
                this.saveUserDocIdToLocalStorage(snapshot.docs[0].id);
                this.user$ = this.userSubject.asObservable();
                resolve("Success"); // Login successful
              } else if (user.password === password && !user.isActive) {
                resolve("User Deactivated"); // Login successful
              } else {
                resolve("Incorrect Password"); // Incorrect password
              }
            } else {
              resolve("User Not Found"); // User not found
            }
          },
          error: (error) => {
            console.error("Error during login:", error);
            reject(false); // Login failed
          },
        });
    });
  }

  getUserRole(): string | null {
    const user = this.userSubject.value || this.getUserFromLocalStorage();
    return user ? user.role || null : null;
  }

  getUserIdNo(): string | null {
    const user = this.userSubject.value || this.getUserFromLocalStorage();
    return user ? user.idNo || null : null;
  }

  getUserDocId(): string | null {
    const user = this.userSubject.value || this.getUserFromLocalStorage();
    return user ? user.id || null : null;
  }

  private getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  }

  private saveUserToLocalStorage(user: User | null) {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }

  private saveUserDocIdToLocalStorage(userDocId: string) {
    if (userDocId) {
      localStorage.setItem("userDocId", userDocId);
    } else {
      localStorage.removeItem("userDocId");
    }
  }

  getUserInitials() {
    const userData = this.getUserFromLocalStorage();

    if (userData) {
      const firstInitial = userData.firstName.charAt(0).toUpperCase(); // Get first letter of firstName
      const lastInitial = userData.lastName.charAt(0).toUpperCase(); // Get first letter of lastName
      return `${firstInitial}${lastInitial}`; // Return initials
    } else {
      console.log("No user data found in local storage.");
      return ""; // Return empty string if no user data
    }
  }

  getUserFullName() {
    const userData = this.getUserFromLocalStorage();

    if (userData) {
      const firstInitial = userData.firstName;
      const lastInitial = userData.lastName;
      return `${firstInitial} ${lastInitial}`;
    } else {
      console.log("No user data found in local storage.");
      return ""; // Return empty string if no user data
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("user");
  }

  // Method to log out
  logout() {
    this.userSubject.next(null); // Clear user data
    this.saveUserToLocalStorage(null); // Remove user from localStorage
  }
}
