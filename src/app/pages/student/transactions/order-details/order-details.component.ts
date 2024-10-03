import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { Product } from 'src/app/models/product.model';
import { Transaction, TransactionDocument } from 'src/app/models/transaction.model';
import { OrderProgress } from 'src/app/models/order-progress.model';
import { OrderService } from 'src/app/services/order.service';
import { ProductsService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import * as _ from "lodash";

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
    private productService: ProductsService,
    private fileUploadService: FileUploadService
  ) {}
  order: Order;
  transaction: Transaction;
  productCodeArr: string[];
  productArr: Product[];
  orderProgress: OrderProgress[] = [];
  // image
  selectedFile: File | null = null;
  isDragOver: boolean = false;
  uploadURL: string = '';
  hasDocument: boolean = false;
  //selected index
  selectedIndex:number = null;

  ngOnInit(): void {
    // Retrieve the transaction ID from the route parameters
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('transactionId');
      console.log('Transaction ID:', this.transactionId);
    });
  this.loadTransaction();
  }
  private loadTransaction(): void {
    this.transactionService.getTransactionById(this.transactionId).subscribe((result) => {
      this.transaction = result;
      console.log(this.transaction);
      debugger;
      if(!_.isEmpty(this.transaction.documents)) {
        this.hasDocument = true;
        this.uploadURL = this.transaction.documents.url;
      }
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
  onFileUpload(event:Event): void{
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }
  // Handle drag-over event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  // Handle drag-leave event
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  // Handle file drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);  // Process the dropped file
    }
  }
  handleFile(file: File): void {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (validImageTypes.includes(file.type)) {
      this.selectedFile = file;
      // this.fileError = null;
      this.fileUploadService.uploadFile(this.selectedFile).subscribe(url => {
        this.uploadURL = url;

        // Save the file metadata to Firestore
        const metadata: TransactionDocument = {
          name: this.selectedFile.name,
          uploadDate: new Date(Date.now()).toISOString(),
          url: url
        }
        this.transaction.documents = metadata
        this.transactionService.saveFileDocumentUrl(this.transactionId,this.transaction)
          .then(() => {console.log('File metadata saved successfully')
            this.hasDocument = true;
          })
          .catch(err => console.error('Error saving metadata:', err));
      });
    } else {
      this.selectedFile = null;
      // this.fileError = 'Only image files are allowed!';
    }
  }
  setOrderProgress():void {
    this.orderProgress = [];
    this.orderProgress.push({title: "1. Order Placed", date: this.order.orderDate})
    this.orderProgress.push({title: "2. Upload Payment Details", date: !_.isEmpty(this.transaction.documents) ? this.transaction.documents.uploadDate: null})
    this.orderProgress.push({title: "3. Awaiting for Payment Confirmation", date: null})
    this.orderProgress.push({title: "4. Item for Pickup", date: null})
    this.orderProgress.push({title: "5. Transaction Complete", date: null})
  }
  setSelectedIndex(index: number){
    if(this.selectedIndex == index){
      this.selectedIndex = null
    } else {
      this.selectedIndex = index
    }
  }
  toggle(step: number): void {
    this.isOpen[step] = !this.isOpen[step];
  }
  isOpen: { [key: number]: boolean } = {
    1: false,
    2: false
  };
}
