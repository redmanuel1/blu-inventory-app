import { Component, Input, OnInit } from '@angular/core';
import { OrderedProducts, Orders } from 'src/app/models/orders.model';
import { CartItem } from 'src/app/models/shoppingcart.model';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ShoppingCartService } from 'src/app/services/shoppingcart.service';
import { TableService } from 'src/app/services/util/table.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit{
  checkOut: CartItem[] = []; 
  sortOrder: string[] = ["imgURL", "name", "size", "price", "quantity","totalPrice"]
  dataColumns: TableColumn[] = []
  orderPlaced: boolean = false;

  fieldConfig: Record<string, { type: ColumnType; hidden?: boolean; editable?: boolean; required?: boolean }> = {
    imgURL: { type: ColumnType.image, hidden: false, editable: false },
    name: { type: ColumnType.text, hidden: false, required: true, editable: false },
    size: { type: ColumnType.text, hidden: false, required: true, editable: false },
    price: { type: ColumnType.checkbox, hidden: true, editable: false },
    quantity: { type: ColumnType.number, hidden: false, required: true, editable: false },
    totalPrice: { type: ColumnType.number, hidden: false, required: true, editable: false }
  };

  htmlDescription: string = "";



constructor(
    private tableService: TableService,
    private firestoreService: FirestoreService, 
    private authService: AuthService,
    private shoppingcartService: ShoppingCartService) {

  firestoreService.collectionName = "Orders";

}

 ngOnInit(): void {
    // Retrieve selected items from session storage
    const selectedItems = sessionStorage.getItem('selectedItems');
    if (selectedItems) {
      this.checkOut = JSON.parse(selectedItems);
      console.log('Selected items for checkout:', this.checkOut);
    } else {
      console.error('No items were received for checkout');
    }
    this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));
    this.htmlDescription = `<h3 class="mr-3">Total Items: <span class="text-info">${this.getTotalItems()}</span></h3>
                  <h3 class="mr-3">Price: <span class="text-info">&#8369; ${this.getTotalPrice()}</span></h3>`;
  }

  // Optionally, clear the session storage when done
  ngOnDestroy(): void {
    sessionStorage.removeItem('selectedItems');
  }

  getTotalItems(): number {
    return this.checkOut.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.checkOut.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  onPlaceOrder(): void {
    const idNo = this.authService.getUserIdNo(); // Retrieve the user's ID
    const timestamp = Date.now().toString(); // Get current timestamp as a string
    const uniqueOrderNo = `ON${idNo}${timestamp}`; // Generate a unique order number
  
    // Map the checkOut array to OrderedProducts array
    const orderedProducts: OrderedProducts[] = this.checkOut.map(item => ({
      productCode: item.productCode,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      variantCode: item.variantCode,
      itemSubtotal: item.totalPrice // Renamed to itemSubtotal
    }));
  
    // Create the new order object with all details
    const newOrder: Orders = {
      idNo: idNo,
      orderDate: new Date().toISOString(), // Save the order date as ISO string
      orderNo: uniqueOrderNo,
      totalPrice: this.getTotalPrice(), // Function to calculate the total price
      products: orderedProducts // List of ordered products
    };
  
    // Call the service to save the order to Firestore, wrapped in an array
    this.firestoreService.addRecords([newOrder])
    .then(() => {
      if(this.checkOut[0].cartID){
        const removePromises = this.checkOut.map(item => this.shoppingcartService.removeFromCart(item.cartID));
        return Promise.all(removePromises); 
      }
    })
    .then(() => {
      console.log('All items removed from the cart successfully.');
      this.orderPlaced = true;
    })
    .catch(error => {
      console.error('Error during placing order or removing items from cart:', error);
    });
  }
}
