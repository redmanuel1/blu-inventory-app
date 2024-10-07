import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order.model';
import { Transaction } from 'src/app/models/transaction.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  orderArr: Order[] = [];
  transactionArr: Transaction[] = [];
  currentTransaction: Transaction;
  constructor(
    private firestoreService: FirestoreService,
  ) {
  }
  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.firestoreService.collectionName = 'Transactions';
    this.firestoreService.getRecords().subscribe(data => {
      this.transactionArr = data;
      this.firestoreService.collectionName = 'Orders';
      this.firestoreService.getRecords().subscribe(data => {
        this.orderArr = data;
      })
    });
  }
  isOrderHasTransaction(orderNo: string): boolean {
    this.getTransactionByOrderNo(orderNo);
    return this.currentTransaction !== undefined ? true : false;
  }

  private getTransactionByOrderNo(orderNo: string): void {
    this.currentTransaction = this.transactionArr.find(transaction => transaction.orderNo == orderNo)
  }

  getTransactionStatusByOrderNo(): string {
    return this.currentTransaction.status
  }

  getTransactionIdByOrderNo(): string {
    return `${this.currentTransaction.id}/order-details`;
  }
  setState() {
    return { student: this.currentTransaction };
  }
}
