import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { Transaction } from 'src/app/models/transaction.model';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  orderArr: Order[] = [];
  transactionArr: Transaction[] = [];
  currentTransaction: Transaction;
  constructor(private orderService: OrderService,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.loadInitialData();
    // this.loadOrders();
    // this.loadTransactions();
  }

  private loadInitialData(): void {
    const combined = combineLatest([this.orderService.getOrders(),this.transactionService.getTransactions()]);
    combined.subscribe((values) => {
      console.log("test");
      for (let index = 0; index < values.length; index++) {
        if(index == 0){
          this.orderArr = values[index];
        } else if(index == 1) {
          this.transactionArr = values[index];
        }        
      }
    })
  }
  isOrderHasTransaction(orderNo: string): boolean {
    this.getTransactionByOrderNo(orderNo);
    return this.currentTransaction !== undefined ? true : false;
  }

  private getTransactionByOrderNo(orderNo: string): void {
    this.currentTransaction = this.transactionArr.find(transaction => transaction.orderNo == orderNo)
    // if(this.currentTransaction !== undefined) {
    //   if(orderNo != this.currentTransaction.orderNo) {
    //     this.currentTransaction = this.transactionArr.find(transaction => transaction.orderNo == orderNo)
    //   }
    // } else {
    //   this.currentTransaction = this.transactionArr[0];
    // }    
  }

  getTransactionStatusByOrderNo(): string {
    // this.getTransactionByOrderNo(orderNo);
    return this.currentTransaction.status
  }

  getTransactionIdByOrderNo(): string {
    // this.getTransactionByOrderNo(orderNo);
    if(this.authService.getUserRole()==='accountant'){
      return `${this.currentTransaction.id}/order-confirmation`
    }
    return `${this.currentTransaction.id}/order-details`;
  }
  setState() {
    return { student: this.currentTransaction };
  }
}
