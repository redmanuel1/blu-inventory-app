import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/shoppingcart.model';
import { ShoppingCartService } from 'src/app/services/shoppingcart.service';

@Component({
  selector: 'app-shoppingcart',
  templateUrl: './shoppingcart.component.html',
  styleUrl: './shoppingcart.component.scss'
})
export class ShoppingcartComponent implements OnInit {

  shoppingCartItems:CartItem[] = []
  selectedItems: CartItem[] = [];

  constructor(
    private shoppingCartService: ShoppingCartService
  ){

  }
  ngOnInit(): void {
    this.getShoppingCartItems()
    console.log(this.shoppingCartItems.length)
  }

  getShoppingCartItems(): void{
    this.shoppingCartService.getCartItems().subscribe((items: CartItem[]) => {
    this.shoppingCartItems = items;
    this.getQuantitiesForCartItems();
    });
  }

  onItemSelectionChange(item: CartItem): void {
    if (item.selected) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.cartID !== item.cartID);
    }
  }

  removeCartItem(item: CartItem): void {
    this.shoppingCartItems = this.shoppingCartItems.filter(i => i.cartID !== item.cartID);
    this.shoppingCartService.removeFromCart(item.cartID);
  }

  getTotal(): number {
    return this.selectedItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getQuantitiesForCartItems(): void {
    this.shoppingCartItems.forEach(item => {
      if (item.variantCode === "SET") {
        this.shoppingCartService.getLowestQuantityForSet(item.productCode, item.size)
          .subscribe(quantity => {
            item.maxQuantity = quantity;
            
          });
      } else if (item.size) {
        this.shoppingCartService.getInventoryQuantityByProductCodeAndVariantCodeAndSize(item.productCode, item.variantCode, item.size)
          .subscribe(quantity => {
            item.maxQuantity = quantity;
           
          });
      } else {
        this.shoppingCartService.getInventoryQuantityByProductCodeAndVariantCode(item.productCode, item.variantCode)
          .subscribe(quantity => {
            item.maxQuantity = quantity;
          });
      }
    });
  }


}
