import { ProductsService } from 'src/app/services/products.service';
import { Component, OnInit } from '@angular/core';
import { TableColumn } from 'src/app/models/util/table.model';
import { Product } from 'src/app/models/product.model';
import { TableService } from 'src/app/services/util/table.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  sortOrder: string[] = ["imgURL", "code", "name", "isSet", "price"]
  dataColumns: TableColumn[] = []
  products: Product[];

  constructor(private productService: ProductsService, private tableService: TableService) {
  }

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.dataColumns = this.tableService.sortDataSet(this.sortOrder, this.tableService.generateDataColumns(this.products));

      console.log(data);
      console.log(this.dataColumns);
    });

    if (this.products) {
    }
    console.log(this.products);

  }

}
