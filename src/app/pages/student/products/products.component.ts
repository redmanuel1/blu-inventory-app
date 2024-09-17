import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null; // Stores the selected product for detailed view

  constructor(
    private productService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Load the list of products
    this.loadProducts();

    // Subscribe to query params to handle changes
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.getProductByCode(code);

      } else {
        this.selectedProduct = null; // Reset selectedProduct if code is not present
      }
    });
  }

  // Method to load products
  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  // Method to get a product by its code
  getProductByCode(code: string): void {
    this.productService.getProductByCode(code).subscribe(product => {
      this.selectedProduct = product;
    });
  }

  // Method to handle product selection
  selectProduct(product: any): void {
    this.router.navigate(['/student/products'], {
      queryParams: { code: product.code },
      queryParamsHandling: 'merge' // Use 'merge' to keep existing query params if any
    });
  }

  // Method to go back to the product list
  backToProducts(): void {
    this.router.navigate(['/student/products'], {
      queryParams: {} // Clear the query parameters
    });

  }
}
