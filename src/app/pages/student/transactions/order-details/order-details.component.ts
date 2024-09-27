import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { Product } from 'src/app/models/product.model';
import { Transaction } from 'src/app/models/transaction.model';
import { OrderProgress } from 'src/app/models/order-progress.model';
import { OrderService } from 'src/app/services/order.service';
import { ProductsService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent  implements OnInit{
  transactionId: string | null = null;
  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private orderService: OrderService, 
    private transactionService: TransactionService,
    private productService: ProductsService
  ) {}
  order: Order;
  transaction: Transaction;
  productCodeArr: string[];
  productArr: Product[];
  orderProgress: OrderProgress[] = [];
  ngOnInit(): void {
    // Retrieve the transaction ID from the route parameters
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('transactionId');
      console.log('Transaction ID:', this.transactionId);
    });

    // const navigation = this.router.getCurrentNavigation();
  // if (navigation?.extras?.state) {
  //   console.log(navigation.extras.state['student']);
  // } else {
  //   // Fallback: handle undefined state (e.g., load student data from an API)
  //   console.log('No student data passed via state.');
  // }
  this.loadTransaction();
  }
  private loadTransaction(): void {
    this.transactionService.getTransactionById(this.transactionId).subscribe((result) => {
      this.transaction = result;
      console.log(this.transaction);
      this.loadOrder();
    })
  }
  private loadOrder(): void {
    this.orderService.getOrderByOrderNo(this.transaction.orderNo).subscribe((result) => {
      this.order = result;
      console.log(this.order)
      this.loadProduct();
    })
  }
  private loadProduct():void {
    this.productCodeArr = this.order.products.map(product => String(product.productCode))
    this.productService.getProductsByCode(this.productCodeArr).subscribe((result) => {
      this.productArr = result;
      this.setOrderProgress();
    })
  }
  getProductDisplay(productCode: string):string {
    return this.productArr.filter((product) => product.code === productCode)[0].name
  }
  setOrderProgress():void {
    this.orderProgress.push({title: "1. Order Placed", date: this.order.orderDate})
    this.orderProgress.push({title: "2. Upload Payment Details", date: null})
    this.orderProgress.push({title: "3. Awaiting for Payment Confirmation", date: null})
    this.orderProgress.push({title: "4. Item for Pickup", date: null})
    this.orderProgress.push({title: "5. Transaction Complete", date: null})
  }
}
