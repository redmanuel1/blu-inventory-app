import { ProductsService } from "src/app/services/products.service";
import { Inventory, Variant, Size } from "./../../../models/inventory.model";
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
  inventory: Inventory;
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
          console.log(this.inventory);
          this.getInventoryItems();
          console.log(this.inventory);
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
    if (this.inventory.variants) {
      this.variants = [...this.inventory.variants];

      // Check if any variant has sizes
      const hasSizes = this.variants.some(
        (variant) => variant.sizes && variant.sizes.length > 0
      );

      if (this.product.isSet && hasSizes && this.inventory.variants.length >1) {
        this.createSizesForSet();
        this.variants.push({
          code: "SET",
          name: "Set",
          price: this.product.price,
          sizes: this.sizesForSet,
        } as Variant);
      } else if (this.product.isSet && !hasSizes && this.inventory.variants.length >1) {
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
    if (this.product.isSet && this.inventory.variants && this.inventory.variants.length >1) {
      const sizeMap: { [sizeName: string]: number } = {};

      this.inventory.variants.forEach((variant) => {
        variant.sizes?.forEach((size) => {
          const sizeName = size.size;
          const quantity =
            size.quantity === undefined || size.quantity === null
              ? 0
              : size.quantity;

          if (sizeMap[sizeName] === undefined) {
            sizeMap[sizeName] = quantity;
          } else {
            sizeMap[sizeName] = Math.min(sizeMap[sizeName], quantity);
          }
        });
      });

      this.sizesForSet = Object.keys(sizeMap).map((sizeName) => ({
        size: sizeName,
        quantity: sizeMap[sizeName],
      })) as Size[];
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
    this.isArray = Array.isArray(this.selectedVariant?.imgURL);
    console.log("selectedVariant", this.selectedVariant);
    if (!this.selectedSetSize) {
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
        imgURL: Array.isArray(this.selectedVariant.imgURL)
          ? this.selectedVariant.imgURL[0]
          : this.selectedVariant.imgURL || "",
        size: this.selectedSetSize ? this.selectedSetSize.size : "",
        name:
          this.selectedVariant.name === "Set"
            ? "Set - " + this.product.name
            : this.selectedVariant.name,
        productName: this.product.name,
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
        imgURL: Array.isArray(this.selectedVariant.imgURL)
          ? this.selectedVariant.imgURL[0]
          : this.selectedVariant.imgURL || "",
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
}
