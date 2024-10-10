// src/app/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  public collectionName
  // Method to get all products
  getRecords():  Observable<any[]> {
    // return this.firestore.collection<Product>('Products').valueChanges();
    return this.firestore.collection<any>(this.collectionName).snapshotChanges().pipe(
      map(actions => 
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id; // Get the document ID
          return { id, ...data }; // Return the complete object
        })
      )
    );
  }

  getRecordById(productId: string): Observable<any> {
    return this.firestore.collection(this.collectionName).doc(productId).valueChanges();
  }

  getRecordByCode(productCode: string): Observable<any> {
    return this.firestore.collection(this.collectionName, ref => ref.where('code', '==', productCode)).valueChanges().pipe(
      map(products => products.length > 0 ? products[0] : null)
    );
  }

  addRecords(products: any[]): Promise<void> {
    const batch = this.firestore.firestore.batch();
    
    products.forEach(product => {
      const id = this.firestore.createId();
      const docRef = this.firestore.collection(this.collectionName).doc(id).ref;
      batch.set(docRef, product);
    });

    return batch.commit(); // Save all in one go
  }

  // Method to update multiple products
  updateRecords(records: any[]): Promise<void> {
    const updates = records.map(record => {
      // Exclude only the 'id' field
      const { id, ...filteredRecord } = record;
  
      // Logic to prepare your Firestore update operation
      const recRef = this.firestore.collection(this.collectionName).doc(id); // Use id to get the document reference
      return recRef.update(filteredRecord); // Update the record without the excluded field
    });
  
    return Promise.all(updates).then(() => {});
  }

  // Method to delete a product
  deleteRecord(recordId: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(recordId).delete();
  }



  // old one
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
  getRecordByidNo(idNo: string): Observable<any> {
    return this.firestore.collection(this.collectionName, ref => ref.where('idNo', '==', idNo))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any; // Get document data
          const id = a.payload.doc.id; // Get document ID
          return { id, ...data }; // Combine document ID with data
        }))
      );
  }

  getRecordByorderNo(orderNo: string): Observable<any> {
    return this.firestore.collection(this.collectionName, ref => ref.where('orderNo', '==', orderNo))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any; // Get document data
          const id = a.payload.doc.id; // Get document ID
          return { id, ...data }; // Combine document ID with data
        }))
      );
  }

  getUserDocId(): string {
      return localStorage.getItem('userDocId')
  }
}
