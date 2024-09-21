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
  }

  getShoppingCartItems(): void{
    this.shoppingCartService.getCartItems().subscribe((items: CartItem[]) => {
    this.shoppingCartItems = items;
    });
  }

  onItemSelectionChange(item: CartItem): void {
    if (item.selected) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.productCode !== item.productCode);
    }
    console.log('Selected items:', this.selectedItems);
  }

}
