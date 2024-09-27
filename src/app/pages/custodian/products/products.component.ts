import { ProductsService } from 'src/app/services/products.service';
import { Component, OnInit } from '@angular/core';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
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

  // Single fieldConfig map to hold all dynamic properties for each field
  fieldConfig: Record<string, { type: ColumnType; hidden?: boolean; editable?: boolean; sortable?: boolean }> = {
    imgURL: { type: ColumnType.image, hidden: false, editable: false, sortable: false },
    code: { type: ColumnType.text, hidden: false, editable: true, sortable: true },
    name: { type: ColumnType.text, hidden: false, editable: true, sortable: true },
    isSet: { type: ColumnType.checkbox, hidden: true, editable: false, sortable: false },
    price: { type: ColumnType.number, hidden: false, editable: true, sortable: true }
  };

  constructor(private productService: ProductsService, private tableService: TableService) {
  }

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      // this.dataColumns = this.tableService.sortDataSet(this.sortOrder, this.tableService.generateDataColumns(this.products));

      this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));

      console.log(data);
      console.log(this.dataColumns);
    });

    if (this.products) {
    }
    console.log(this.products);

  }

}
