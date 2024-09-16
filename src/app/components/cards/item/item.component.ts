import { Component, Input, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/shoppingcart.model';
import { ShoppingCartService } from 'src/app/services/shoppingcart.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() product: any; // Product input from the parent component
  selectedVariant: any = null; // Stores the selected variant
  selectedSize: any = null; // Stores the selected size for individual variants
  selectedSetSize: any = null; // Stores the selected size for sets
  variantsWithSet: any[] = []; // Stores the variants including the "Set" option
  availableSetSizes: any[] = [];
  totalSetPrice: number = 0;
  quantity: number = 1; // Initial quantity
  maxQuantity: number = 0; // Max quantity based on available stock

  constructor(private shoppingcartService: ShoppingCartService){

  }

  ngOnInit(): void {
    if (this.product && this.product.Variants) {
      this.initializeVariants();
    }
  }

  // Initialize the variants and add the "Set" option if isSet is true
  initializeVariants(): void {
    this.variantsWithSet = [...this.product.Variants];

    if (this.product.isSet) {
      // Add a special "Set" option
      this.variantsWithSet.unshift({ name: 'Set' });
    }
  }

  // Function to handle variant selection
  selectVariant(variant: any): void {
    this.selectedVariant = variant;

    if (variant.name === 'Set') {
      // For "Set" variants, calculate available sizes and total price
      this.calculateSetSizes();
      this.calculateSetPrice();
      this.selectedSize = null; // Ensure we don't select sizes for individual variants
      this.selectedSetSize = null; // Ensure we reset the set size
      this.maxQuantity = 0;
    } else if(variant.sizes && variant.sizes.length > 0) {
      // For individual variants, set the sizes and price
      this.availableSetSizes = []; // Clear set sizes to avoid conflicts
      this.selectedSize = null; // Reset the selected size
      this.maxQuantity = 0; // Reset the max quantity
      this.quantity = 1; // Reset quantity to 1
    } else{
      this.maxQuantity = variant.quantity; // Set max quantity based on the variant
      this.quantity = 1; // Reset quantity to 1
      this.selectedSize = null; // No size selection needed
    }
  }

  // Function to handle individual variant size selection
  selectSize(size: any): void {
    this.selectedSize = size;
    this.maxQuantity = size.quantity; // Set the max quantity based on size's available quantity
    this.quantity = 1; // Reset the quantity to 1 when a new size is selected
  }

  // Function to handle set size selection
  selectSetSize(size: any): void {
    this.selectedSetSize = size;
    this.maxQuantity = size.quantity; // Set the max quantity based on size's available quantity
    this.quantity = 1; // Reset the quantity to 1 when a new size is selected
  }

  // Calculate the available sizes for the "Set" option
  calculateSetSizes(): void {
    const sizeAvailability: { [key: string]: { name: string, available: boolean, quantity: number } } = {};
  
    // Loop through all variants and their sizes
    this.product.Variants.forEach(variant => {
      variant.sizes.forEach(size => {
        if (!sizeAvailability[size.name]) {
          // Initialize size availability
          sizeAvailability[size.name] = { name: size.name, available: size.quantity > 0, quantity: size.quantity };
        }
  
        // If any variant has 0 quantity for this size, mark it as unavailable
        if (size.quantity === 0) {
          sizeAvailability[size.name].available = false;
        }
  
        // Update quantity to reflect the smallest available quantity
        sizeAvailability[size.name].quantity = Math.min(sizeAvailability[size.name].quantity, size.quantity);
      });
    });
  
    // Convert the sizeAvailability object to an array of sizes
    this.availableSetSizes = Object.values(sizeAvailability);
  }

  // Calculate the total price for the "Set"
  calculateSetPrice(): void {
    this.totalSetPrice = this.product.Variants.reduce((total: number, variant: any) => {
      return total + (variant.price || 0);
    }, 0);
  }

  // Increase quantity, respecting the max quantity for the selected size
  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  // Decrease quantity, but not below 1
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
      variantName: this.selectedVariant.name
    };

    // Add the selected product to the cart using the shopping cart service
    this.shoppingcartService.addToCart(cartItem)
      .then(() => {
        console.log('Product added to cart');
      })
      .catch((error) => {
        console.error('Error adding product to cart:', error);
      });
  }

}
