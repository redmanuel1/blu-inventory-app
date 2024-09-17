import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/models/shoppingcart.model';
import { AuthService } from 'src/app/services/auth.service';
import { ShoppingCartService } from 'src/app/services/shoppingcart.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() product: any; 
  selectedVariant: any = null; 
  selectedSize: any = null;
  selectedSetSize: any = null; 
  variantsWithSet: any[] = []; 
  availableSetSizes: any[] = [];
  totalSetPrice: number = 0;
  quantity: number = 1; 
  maxQuantity: number = 0; 
  productCode: string | null = null;

  constructor(
    private shoppingcartService: ShoppingCartService, 
    private route: ActivatedRoute,
    private authService: AuthService){
  }

  ngOnInit(): void {
    if (this.product && this.product.Variants) {
      this.initializeVariants();
      if (this.variantsWithSet.length > 0) {
        this.selectVariant(this.variantsWithSet[0]);
  
        // If the first variant has sizes, auto-select the first size
        if (this.selectedVariant && this.selectedVariant.sizes && this.selectedVariant.sizes.length > 0) {
          this.selectSize(this.selectedVariant.sizes[0]);
        }
      }
    }
  }

  initializeVariants(): void {
    this.variantsWithSet = [...this.product.Variants];

    if (this.product.isSet) {
      this.variantsWithSet.unshift({ name: 'Set' });
    }
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;

    if (variant.name === 'Set') {
      this.calculateSetSizes();
      this.calculateSetPrice();
      this.selectedSize = null; 
      this.selectedSetSize = null;
      this.maxQuantity = 0;
    } else if(variant.sizes && variant.sizes.length > 0) {
      this.availableSetSizes = []; 
      this.selectedSize = null; 
      this.maxQuantity = 0; 
      this.quantity = 1; 
    } else{
      this.maxQuantity = variant.quantity; 
      this.quantity = 1;
      this.selectedSize = null; 
    }
  }

  
  selectSize(size: any): void {
    this.selectedSize = size;
    this.maxQuantity = size.quantity; 
    this.quantity = 1; 
  }

  
  selectSetSize(size: any): void {
    this.selectedSetSize = size;
    this.maxQuantity = size.quantity;
    this.quantity = 1; 
  }

  
  calculateSetSizes(): void {
    const sizeAvailability: { [key: string]: { name: string, available: boolean, quantity: number } } = {};
  

    this.product.Variants.forEach(variant => {
      variant.sizes.forEach(size => {
        if (!sizeAvailability[size.name]) {
      
          sizeAvailability[size.name] = { name: size.name, available: size.quantity > 0, quantity: size.quantity };
        }
  

        if (size.quantity === 0) {
          sizeAvailability[size.name].available = false;
        }
  

        sizeAvailability[size.name].quantity = Math.min(sizeAvailability[size.name].quantity, size.quantity);
      });
    });
  

    this.availableSetSizes = Object.values(sizeAvailability);
  }


  calculateSetPrice(): void {
    this.totalSetPrice = this.product.Variants.reduce((total: number, variant: any) => {
      return total + (variant.price || 0);
    }, 0);
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

  addToCart(): void {
    const selectedItemPrice = this.selectedVariant
  ? (this.selectedVariant.name === 'Set' ? this.totalSetPrice : this.selectedVariant.price) 
  : this.product.price;

    const cartItem: CartItem = {
      productCode: this.product.code,
      name: this.product.name,
      size: this.selectedSize ? this.selectedSize.name : "", 
      quantity: this.quantity,
      price: selectedItemPrice,
      total: selectedItemPrice * this.quantity,
      variantName: this.selectedVariant.name,
      idNo: this.authService.getUserIdNo()
    };


    this.shoppingcartService.addToCart(cartItem)
      .then(() => {
        console.log('Product added to cart');
      })
      .catch((error) => {
        console.error('Error adding product to cart:', error);
      });
  }

}
