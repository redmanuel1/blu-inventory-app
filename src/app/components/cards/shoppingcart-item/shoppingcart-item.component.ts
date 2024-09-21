import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartItem } from 'src/app/models/shoppingcart.model';

@Component({
  selector: 'app-shoppingcart-item',
  templateUrl: './shoppingcart-item.component.html',
  styleUrl: './shoppingcart-item.component.scss'
})

export class ShoppingcartItemComponent implements OnInit {
  @Input() cartItem: CartItem;
  @Output() selectionChange = new EventEmitter<CartItem>();

  ngOnInit(): void {
  }


  onCheckboxChange(): void {
    this.selectionChange.emit(this.cartItem); 
  }

  decreaseQuantity(): void {
    if (this.cartItem.quantity > 1) {
      this.cartItem.quantity--;
    }
  }

  
  increaseQuantity(): void {
    if (this.cartItem.quantity < 10) { 
      this.cartItem.quantity++;
    }
  }

}
