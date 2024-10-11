import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderProduct } from 'src/app/models/order.model';
import { Transaction, TransactionComment } from 'src/app/models/transaction.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { switchMap } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  transactionId: string | null = null;
  orderedProducts: Order | null = null;
  transaction: Transaction | null = null;
  userName: string = '';
  newComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) {
    firestoreService.collectionName = "Transactions";
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('transactionId');
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
          this.userName = `${userData[0].firstName} ${userData[0].lastName}`;
        }
      });
    }
  }

  parseUploadDateAsDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const format = 'MMMM d, y, h:mm a';
    const locale = 'en-US';
    const timezone = 'UTC';
    return formatDate(date, format, locale, timezone);
  }

  addComment(form: NgForm) {
    // Check if the form is valid
    if (form.valid) {
        const comment: TransactionComment = {
            comment: this.newComment,
            commentDate: new Date().toISOString(),
            user: this.userName
        };
        
        // Initialize comments array if not present
        if (!this.transaction.comments) {
            this.transaction.comments = [];
        }
        
        // Add the new comment to the transaction
        this.transaction.comments.push(comment);
        
        // Reset the textarea and the form
        this.newComment = '';
        form.resetForm(); // Reset the form
    } else {
        console.warn('Comment form is invalid or empty.');
    }
}
}
