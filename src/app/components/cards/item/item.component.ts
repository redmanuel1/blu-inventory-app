import { Inventory, Variant, Size } from './../../../models/inventory.model';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { CartItem } from 'src/app/models/shoppingcart.model';
import { AuthService } from 'src/app/services/auth.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ShoppingCartService } from 'src/app/services/shoppingcart.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() product: Product; 
  inventory: Inventory;
  variants: Variant[] = [];
  sizesForSet: Size[] = [];
  selectedVariant: Variant | null = null;
  selectedSetSize: Size | null = null;
  maxQuantity = 0;
  quantity = 1;

  constructor(
    private inventoryService: InventoryService
  ) {}

  ngOnInit(): void {
    this.inventoryService.getInventoryByProductCode(this.product.code).subscribe(data => {
      if (data) {
        this.inventory = data;
        console.log(this.inventory);
        this.getInventoryItems();
        if (this.variants.length > 0) {
          this.selectVariant(this.variants[0])
          if (this.selectedVariant.sizes && this.selectedVariant.sizes.length > 0) {
            this.selectSetSize(this.selectedVariant.sizes[0]);
          }
        }
      } else {
        console.warn('No inventory found.');
      }
    });
  }

  getInventoryItems() {
    if (this.inventory.variants) {
      if (this.inventory.isSet) {
        this.createSizesForSet(); 
        this.variants = [
          ...this.inventory.variants,
          { 
            code: 'SET', 
            name: 'Set',
            price: this.product.price,
            sizes: this.sizesForSet 
          } as Variant
        ];
      } else {
        this.variants = [...this.inventory.variants];
      }
    }
  }

  createSizesForSet() {
    if (this.inventory.isSet && this.inventory.variants) {
      const sizeMap: { [sizeName: string]: number } = {};
  
      this.inventory.variants.forEach(variant => {
        variant.sizes?.forEach(size => {
          const sizeName = size.size; 
          const quantity = size.quantity === undefined || size.quantity === null ? 0 : size.quantity;
  
  
          if (sizeMap[sizeName] === undefined) {
            sizeMap[sizeName] = quantity;
          } else {
            sizeMap[sizeName] = Math.min(sizeMap[sizeName], quantity);
          }
        });
      });
  
  
      this.sizesForSet = Object.keys(sizeMap).map(sizeName => ({
        size: sizeName, 
        quantity: sizeMap[sizeName]
      })) as Size[];
    }
  }

  selectSetSize(size: any): void {
    this.selectedSetSize = size;
    this.maxQuantity = size.quantity;
    if(this.maxQuantity==0){
      this.quantity = 0
    }else{
      this.quantity = 1; 
    }

    
  }
  
  
  selectVariant(variant: Variant) {
    this.selectedVariant = variant;
    console.log("selectedVariant", this.selectedVariant)
    if(!this.selectedSetSize){
      this.maxQuantity = variant.quantity;
      if(this.maxQuantity==0){
        this.quantity = 0
      }else{
        this.quantity = 1; 
      }
    }
  }

  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

 
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
