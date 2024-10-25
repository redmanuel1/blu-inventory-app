import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Inventory } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(
    private firestore: AngularFirestore) { }

  // Function to get a single inventory item by product code
  getInventoryByProductCode(productCode: string): Observable<Inventory[]> {
    return this.firestore.collection<Inventory>('Inventory', ref => ref.where('productCode', '==', productCode)).snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Inventory; // Get document data
          const id = a.payload.doc.id; // Get the document ID
          return { id, ...data }; // Return the complete object with ID
        })
      ),
      catchError(err => {
        console.error('Error fetching inventory:', err);
        return of([]); // Return an empty array in case of an error
      })
    );
  }
}
