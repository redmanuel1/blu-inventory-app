import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderProduct } from 'src/app/models/order.model';
import { Transaction } from 'src/app/models/transaction.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  transactionId: string | null = null;
  orderedProducts: Order | null = null; // Initialize to null
  transaction: Transaction | null = null; // Initialize to null
  userName: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) {
    firestoreService.collectionName = "Transactions";
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('transactionId');
      console.log('Transaction ID:', this.transactionId);
      if (this.transactionId) {
        this.fetchTransactionDetails(this.transactionId);
      }
    });
  }

  fetchTransactionDetails(transactionId: string): void {
    this.firestoreService.getRecordById(transactionId).pipe(
      switchMap(transactionData => {
        if (transactionData) {
          this.transaction = transactionData;
          const orderNo = transactionData.orderNo;
          this.firestoreService.collectionName = "Orders";
          if (orderNo) {
            return this.firestoreService.getRecordByorderNo(orderNo);
          }
        }
        return [];
      })
    ).subscribe(orderData => {
      if (orderData && orderData.length > 0) {
        this.orderedProducts = orderData[0];
        console.log("Ordered Products:", this.orderedProducts);
        
        if (this.orderedProducts) {
          this.firestoreService.collectionName = "Users";
          this.getUserFullName(this.orderedProducts.idNo); 
        }
      }
    });
  }

  getUserFullName(idNo: string): void {
    if (idNo) {
      this.firestoreService.getRecordByidNo(idNo).subscribe(userData => {
        if (userData && userData.length > 0) {
          console.log("User Data:", userData[0]);
          this.userName = `${userData[0].firstName} ${userData[0].lastName}`;
        }
      });
    } else {
      console.error('User ID is undefined');
    }
  }
}
