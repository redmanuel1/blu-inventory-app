// src/app/services/firestore.service.ts
import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/compat/firestore";
import { map, Observable } from "rxjs";
import { User } from "../models/user.model";
import { WhereFilterOp, CollectionReference, Query } from "firebase/firestore";
import firebase from "firebase/compat/app"; // Import the core firebase app
import "firebase/compat/firestore";

@Injectable({
  providedIn: "root",
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  public collectionName;
  public subCollectionName;
  // Method to get all products
  getRecords(): Observable<any[]> {
    // return this.firestore.collection<Product>('Products').valueChanges();
    return this.firestore
      .collection<any>(this.collectionName)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id; // Get the document ID
            return { id, ...data }; // Return the complete object
          })
        )
      );
  }

  getRecordsByField(fieldName: string, fieldValue: any): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where(fieldName, "==", fieldValue)
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data: Object = a.payload.doc.data();
            const id = a.payload.doc.id; // Get the document ID
            return { id, ...data }; // Return the complete object
          })
        )
      );
  }

  getRecordByFields(
    conditions: { field: string; operator: WhereFilterOp; value: any }[]
  ): Promise<{ id: string; data: any }[]> {
    // Start with a reference to the collection
    const collectionRef = this.firestore.collection(this.collectionName).ref; // Get CollectionReference

    // Start building a query using the collection reference
    let queryRef = collectionRef as firebase.firestore.Query; // Cast to Query

    // Apply conditions to build the query
    conditions.forEach((condition) => {
      queryRef = queryRef.where(
        condition.field,
        condition.operator,
        condition.value
      );
    });

    // Execute the query
    return queryRef
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.warn("No matching documents found.");
          return []; // Return an empty array if no documents found
        }

        // Map the snapshot to return an array of objects with id and data
        const results = snapshot.docs.map((doc) => ({
          id: doc.id, // Get the document ID
          data: doc.data(), // Get the document data
        }));

        return results; // Return the array of results
      })
      .catch((error) => {
        console.error("Error fetching records:", error);
        return Promise.reject(error); // Reject the promise with the error
      });
  }

  getRecordsSortedByOrderDate(): Observable<any[]> {
    // return this.firestore.collection<Product>('Products').valueChanges();
    return this.firestore
      .collection<any>(this.collectionName, (ref) =>
        ref.orderBy("orderDate", "desc")
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id; // Get the document ID
            return { id, ...data }; // Return the complete object
          })
        )
      );
  }

  getRecordById(productId: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName)
      .doc(productId)
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          const data = snapshot.payload.data();
          const id = snapshot.payload.id;
          // Return null or handle the case when the document does not exist
          if (!data) {
            return null;
          }
          return { id, ...(data as object) }; // Return document data along with the document ID
        })
      );
  }

  getRecordByCode(productCode: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where("code", "==", productCode)
      )
      .valueChanges()
      .pipe(map((products) => (products.length > 0 ? products[0] : null)));
  }

  getRecordByCodeArr(productCodeArr: string[]): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where("code", "in", productCodeArr)
      )
      .valueChanges();
  }

  getRecordByOrderNo(orderNo: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where("orderNo", "==", orderNo)
      )
      .valueChanges()
      .pipe(map((orders) => (orders.length > 0 ? orders[0] : null)));
  }

  // Notifications
  getSRecordByDocIdWithSubCollections(parentDocId: string): Observable<any[]> {
    // return this.firestore.collection<Product>('Products').valueChanges();
    return this.firestore
      .collection<any>(
        `${this.collectionName}/${parentDocId}/${this.subCollectionName}`
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id; // Get the document ID
            return { id, ...data }; // Return the complete object
          })
        )
      );
  }

  addSubCollectionRecords(parentDocId: string, data: any[]): Promise<void> {
    const batch = this.firestore.firestore.batch();

    data.forEach((product) => {
      const id = this.firestore.createId();
      const docRef = this.firestore
        .collection(
          `${this.collectionName}/${parentDocId}/${this.subCollectionName}`
        )
        .doc(id).ref;
      batch.set(docRef, product);
    });

    return batch.commit(); // Save all in one go
  }

  addRecords(records: any[]): Promise<void> {
    const batch = this.firestore.firestore.batch();

    records.forEach((item) => {
      const id = this.firestore.createId();
      const docRef = this.firestore.collection(this.collectionName).doc(id).ref;
      batch.set(docRef, item);
    });

    return batch.commit(); // Save all in one go
  }

  // Method to update multiple products
  async updateRecords(records: any[]): Promise<void> {
    const updates = records.map((record) => {
      // Exclude only the 'id' field
      const { id, ...filteredRecord } = record;

      // Logic to prepare your Firestore update operation
      const recRef = this.firestore.collection(this.collectionName).doc(id); // Use id to get the document reference
      return recRef.update(filteredRecord); // Update the record without the excluded field
    });

    await Promise.all(updates);
  }

  async updateSubCollectionRecords(
    parentDocId: string,
    records: any[]
  ): Promise<void> {
    const updates = records.map((record) => {
      // Exclude only the 'id' field
      const { id, ...filteredRecord } = record;

      // Logic to prepare your Firestore update operation
      const recRef = this.firestore
        .collection(
          `${this.collectionName}/${parentDocId}/${this.subCollectionName}`
        )
        .doc(id); // Use id to get the document reference
      return recRef.update(filteredRecord); // Update the record without the excluded field
    });

    await Promise.all(updates);
  }

  // Method to delete a product
  deleteRecord(recordId: string): Promise<void> {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordId)
      .delete();
  }

  // old one
  // Method to add user to Firestore
  addUser(user: any): Promise<void> {
    const userId = this.firestore.createId(); // Generate unique ID
    return this.firestore.collection("Users").doc(userId).set(user);
  }
  // to be continued
  updateUser(user: User): Promise<void> {
    console.log("test update");
    console.log("to update");
    return this.firestore
      .collection("Users")
      .doc(this.getUserDocId())
      .update(user);
  }

  // Method to get a user by idNo
  getRecordByidNo(idNo: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) => ref.where("idNo", "==", idNo))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any; // Get document data
            const id = a.payload.doc.id; // Get document ID
            return { id, ...data }; // Combine document ID with data
          })
        )
      );
  }

  getRecordByorderNo(orderNo: string): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where("orderNo", "==", orderNo)
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any; // Get document data
            const id = a.payload.doc.id; // Get document ID
            return { id, ...data }; // Combine document ID with data
          })
        )
      );
  }

  getUserDocId(): string {
    return localStorage.getItem("userDocId");
  }
}
