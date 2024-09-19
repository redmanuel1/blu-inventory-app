// src/app/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  // Method to add user to Firestore
  addUser(user: any): Promise<void> {
    const userId = this.firestore.createId(); // Generate unique ID
    return this.firestore.collection('Users').doc(userId).set(user);
  }
// to be continued
  updateUser(user: User): Promise<void> {
    console.log("test update");
    console.log("to update")
    return this.firestore.collection('Users').doc(this.getUserDocId()).update(user);
  }

  // Method to get a user by idNo
  getUserByIdNo(idNo: string): Observable<any> {
    return this.firestore.collection('Users', ref => ref.where('idNo', '==', idNo)).valueChanges();
  }

  getUserDocId(): string {
      return localStorage.getItem('userDocId')
  }
}
