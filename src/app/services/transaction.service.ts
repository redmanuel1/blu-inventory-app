import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Transaction } from '../models/transaction.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  transactionCollection: AngularFirestoreCollection<Transaction>;
  constructor(private firestore: AngularFirestore) { 
    this.transactionCollection = this.firestore.collection<Transaction>('Transactions');
  }
  
  getTransactions():  Observable<Transaction[]> {
    return this.transactionCollection.snapshotChanges()
    .pipe(
      map(resultArr => resultArr.map(
        result => {
          const data = result.payload.doc.data() as Transaction;
          const id = result.payload.doc.id;
          return {id, ...data};
        }
      ))
    );
  }
  getTransactionById(transactionId: string): Observable<Transaction> {
    return this.transactionCollection.doc(transactionId).valueChanges();
  }

  saveFileDocumentUrl(transactionId: string, updateFields: Transaction): Promise<any> {
    return this.transactionCollection.doc(transactionId).update(updateFields)
    .then(() => console.log('Transaction updated'))
    .catch((error) => console.error('Error updating transaction:', error));
  }
}
