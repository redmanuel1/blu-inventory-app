import { ProductsService } from "src/app/services/products.service";
import { Inventory, Variant, Size, GroupedInventoryVariant } from "./../../../models/inventory.model";
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Product } from "src/app/models/product.model";
import { CartItem } from "src/app/models/shoppingcart.model";
import { AuthService } from "src/app/services/auth.service";
import { InventoryService } from "src/app/services/inventory.service";
import { ShoppingCartService } from "src/app/services/shoppingcart.service";
import { ToastService } from "../../modal/toast/toast.service";
import { ToastComponent } from "../../modal/toast/toast.component";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-item",
  templateUrl: "./item.component.html",
  styleUrls: ["./item.component.scss"],
})
export class ItemComponent implements OnInit, AfterViewInit {
  product: Product;
  inventory: Inventory[] = [];
  groupedInventory: GroupedInventoryVariant[] = [];
  variants: Variant[] = [];
  sizesForSet: Size[] = [];
  selectedVariant: Variant | null = null;
  selectedSetSize: Size | null = null;
  maxQuantity = 0;
  quantity = 1;
  selectedItem: CartItem[] = [];
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  isArray: boolean = false;
  currentImageIndex = 0;
  imgURLsForSet: string[] = [];

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private productService: ProductsService,
    private shoppingCartService: ShoppingCartService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private spinnerService: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.getProductCodeFromRoute();
  }

  ngAfterViewInit() {
    this.toastService.registerToast(this.toastComponent);
  }

  getProductCodeFromRoute(): void {
    this.spinnerService.show();
    this.route.params.subscribe({
      next: (params) => {
        const code = params["code"];
        if (code) {
          this.getProductByCode(code);
          this.getInventoryItemByCode(code); // Fetch the product by code
        }
      },
      error: (error) => {
        this.spinnerService.hide();
      },
    });
  }

  getProductByCode(code: string): void {
    this.spinnerService.show();
    this.productService.getProductByCode(code).subscribe({
      next: (data) => {
        this.product = data;
      },
      error: (error) => {
        this.spinnerService.hide();
      },
    });
  }

  getInventoryItemByCode(code: string) {
    this.spinnerService.show();
    this.inventoryService.getInventoryByProductCode(code).subscribe({
      next: (data) => {
        if (data) {
          this.inventory = data;
          
          this.variants = this.groupInventoryByCode(this.inventory)
          
          this.getInventoryItems();
          
          if (this.variants.length > 0) {
            this.selectVariant(this.variants[0]);
            if (
              this.selectedVariant.sizes &&
              this.selectedVariant.sizes.length > 0
            ) {
              this.selectSetSize(this.selectedVariant.sizes[0]);
            }
          }
        } else {
          console.warn("No inventory found.");
        }
        this.spinnerService.hide();
      },
      error: (error) => {
        this.spinnerService.hide();
      },
    });
  }

  getInventoryItems() {
    if (this.variants.length > 0) {
      // this.variants = [...this.inventory.variants];

      // Check if any variant has sizes
      const hasSizes = this.variants.some(
        (variant) => variant.sizes && variant.sizes.length > 0
      );

      if (this.product.isSet && hasSizes && this.variants.length >1) {
        this.createSizesForSet();
        this.variants.push({
          code: "SET",
          name: "Set",
          imgURL: this.imgURLsForSet,
          price: this.product.price,
          sizes: this.sizesForSet,
        } as Variant);
      } else if (this.product.isSet && !hasSizes && this.variants.length >1) {
        const minQuantity = Math.min(
          ...this.variants.map((variant) => variant.quantity || Infinity)
        );

        this.variants.push({
          code: "SET",
          name: "Set",
          price: this.product.price,
          quantity: minQuantity === Infinity ? 0 : minQuantity,
        } as Variant);
      }
    }
  }

  createSizesForSet() {
    if (this.product.isSet && this.variants.length > 1) {
      const sizeMap: { [sizeName: string]: number } = {};
      const sizeCount: { [sizeName: string]: number } = {};
      const imgURLSet: Set<string> = new Set(); // Using a Set to store unique imgURLs
      const idMap: { [sizeName: string]: string[] } = {}; // New map to track IDs for each size
  
      // Iterate over each variant
      this.variants.forEach((variant) => {
        // Check if the variant has sizes
        variant.sizes?.forEach((size) => {
          const sizeName = size.size;
          const quantity = size.quantity || 0; // Default to 0 if quantity is undefined
  
          // Count the size occurrences
          sizeCount[sizeName] = (sizeCount[sizeName] || 0) + 1;
  
          // Initialize or update the minimum quantity for the size
          if (sizeMap[sizeName] === undefined) {
            sizeMap[sizeName] = quantity;
          } else {
            // Update to the minimum quantity across variants
            sizeMap[sizeName] = Math.min(sizeMap[sizeName], quantity);
          }
  
          // Add the ID to the idMap for this size
          if (!idMap[sizeName]) {
            idMap[sizeName] = [];
          }
          idMap[sizeName].push(...size.id); // Push all IDs from the current size
        });
  
        // Add imgURLs to the Set for uniqueness
        if (variant.imgURL) {
          variant.imgURL.forEach(img => imgURLSet.add(img)); // Assuming imgURL is an array
        }
      });
  
      // Filter sizes that appear in all variants
      const totalVariants = this.variants.length;
      this.sizesForSet = Object.keys(sizeCount)
        .filter(sizeName => sizeCount[sizeName] === totalVariants) // Only include sizes present in all variants
        .map(sizeName => ({
          size: sizeName,
          id: Array.from(new Set(idMap[sizeName])), // Use Set to ensure unique IDs
          quantity: sizeMap[sizeName],
          imgURL: Array.from(imgURLSet).length > 0 ? Array.from(imgURLSet) : ['assets/img/logo/b_logo.png'], // Add imgURL here
        })) as Size[];
  
      // Optional: You can store the imgURLsForSet property if you need to use it elsewhere
      this.imgURLsForSet = Array.from(imgURLSet);
      if (this.imgURLsForSet.length === 0) {
        this.imgURLsForSet = ['assets/img/logo/b_logo.png']; // Set default image URL if no images available
      }
    }
  }
  
  

  selectSetSize(size: any): void {
    this.selectedSetSize = size;
    this.maxQuantity = size.quantity;
    if (this.maxQuantity == 0) {
      this.quantity = 0;
    } else {
      this.quantity = 1;
    }
  }

  selectVariant(variant: Variant) {
    this.selectedVariant = variant;
    this.currentImageIndex = 0;
    // this.isArray = Array.isArray(this.selectedVariant?.imgURL);
    // console.log("selectedVariant", this.selectedVariant);
    if (variant.sizes.length == 0) {
      this.maxQuantity = variant.quantity;
      if (this.maxQuantity == 0) {
        this.quantity = 0;
      } else {
        this.quantity = 1;
      }
    } else {
      this.selectSetSize(this.selectedVariant.sizes[0]);
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

  addToCart(): void {
    this.spinnerService.show();
    if (this.selectedVariant && this.maxQuantity > 0) {
      const cartItem: CartItem = {
        cartID: this.generateUniqueCartID(),
        idNo: this.authService.getUserIdNo(), // Replace with actual user ID
        orderDate: new Date().toISOString(), // Current date
        productCode: this.product.code,
        variantCode: this.selectedVariant.code,
        price: this.selectedVariant.price,
        quantity: this.quantity,
        totalPrice: this.selectedVariant.price * this.quantity,
        imgURL:  Array.isArray(this.selectedVariant.imgURL) && this.selectedVariant.imgURL.length > 0
        ? this.selectedVariant.imgURL // Ensure this is an array
        : [],
        size: this.selectedSetSize ? this.selectedSetSize.size : "",
        name:
          this.selectedVariant.name === "Set"
            ? "Set - " + this.product.name
            : this.selectedVariant.name,
        productName: this.product.name,
        inventoryID: this.selectedSetSize  ? this.selectedSetSize.id : [this.selectedVariant.id]
      };

      this.shoppingCartService.addToCart(cartItem);
      const message = cartItem.size
        ? `${cartItem.name} size ${cartItem.size} successfully added to cart!`
        : `${cartItem.name} successfully added to cart!`;
      this.toastService.showToast(message, "success");
    } else {
      const message = this.selectedSetSize
        ? `${this.selectedVariant.name} size ${this.selectedSetSize.size} is not available!`
        : `${this.selectedVariant.name} is not available!`;
      this.toastService.showToast(message, "error");
    }
    this.spinnerService.hide();
  }

  generateUniqueCartID(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  proceedToCheckOut() {
    this.spinnerService.show();
    if (this.product && this.selectedVariant && this.maxQuantity > 0) {
      const cartItem: CartItem = {
        // cartID: this.generateUniqueCartID(),
        idNo: this.authService.getUserIdNo(), // Replace with actual user ID
        orderDate: new Date().toISOString(), // Current date
        productCode: this.product.code,
        variantCode: this.selectedVariant.code,
        price: this.selectedVariant.price,
        quantity: this.quantity,
        totalPrice: this.selectedVariant.price * this.quantity,
        imgURL: Array.isArray(this.selectedVariant.imgURL) && this.selectedVariant.imgURL.length > 0
        ? this.selectedVariant.imgURL // Ensure this is an array
        : [],
        size: this.selectedSetSize ? this.selectedSetSize.size : "",
        name:
          this.selectedVariant.name === "Set"
            ? "Set - " + this.product.name
            : this.selectedVariant.name,
        productName: this.product.name,
      };
      this.selectedItem.push(cartItem);
      sessionStorage.setItem(
        "selectedItems",
        JSON.stringify(this.selectedItem)
      );

      this.router.navigate([`/student/products/${this.product.code}/checkout`]);
    } else {
      this.toastService.showToast(
        "Selected product is not available at the moment",
        "error"
      );
    }
    this.spinnerService.hide();
  }

  isImageArray(): boolean {
    return Array.isArray(this.selectedVariant?.imgURL);
  }

  get imageCount(): number {
    return this.selectedVariant?.imgURL?.length || 0;
  }

  nextImage(): void {
    if (this.currentImageIndex < this.imageCount - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0; // Loop back to the first image
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.imageCount - 1; // Loop to the last image
    }
  }


  groupInventoryByCode(inventoryItems: Inventory[]): GroupedInventoryVariant[] {
    const grouped = inventoryItems.reduce((acc, item) => {
      const { code, name, price, productCode, imgURL = [], size, quantity, id } = item;
      
      if (!acc[code]) {
        acc[code] = {
          code,
          name,
          price,
          productCode,
          imgURL: imgURL || [],
          quantity: 0, // Initialize quantity to 0
          sizes: [], // Initialize sizes array
          id
        } as GroupedInventoryVariant;
      }
  
      // Check if the item has a size
      if (size) {
        acc[code].sizes?.push({ size, quantity, id:[id]});
      } else {
        // If there are no sizes, add quantity to the grouped variant
        acc[code].quantity += quantity; // Add quantity to the total quantity
      }
      
      return acc;
    }, {} as { [key: string]: GroupedInventoryVariant });
  
    return Object.values(grouped);
  }
  
}
