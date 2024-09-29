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
  fieldConfig: Record<string, { type: ColumnType; hidden?: boolean; editable?: boolean; required?: boolean }> = {
    imgURL: { type: ColumnType.image, hidden: false, editable: false },
    code: { type: ColumnType.text, hidden: false, required: true, editable: true },
    name: { type: ColumnType.text, hidden: false, required: true, editable: true },
    isSet: { type: ColumnType.checkbox, hidden: true, editable: false },
    price: { type: ColumnType.number, hidden: false, required: true, editable: true }
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

  }

  saveProducts(records: any[]) {
     // Assuming records can contain both new and updated items
    const updates = records.filter(record => record.isEditing); // or however you want to differentiate

    if (updates.length) {
      this.productService.updateProducts(updates).then(() => {
        console.log('Updated products saved!');
        // this.loadProducts(); // Reload products if needed to reflect changes
      }).catch(error => {
        console.error('Error updating products:', error);
      });
    }

    const newRecords = records.filter(record => !record.isEditing); // Extract new records
    if (newRecords.length) {
      this.productService.addProducts(newRecords).then(() => {
        console.log('New products saved!');
      }).catch(error => {
        console.error('Error saving new products:', error);
      });
    }
  }

  deleteProduct(record: any) {
    // Call your service to delete the record from Firestore
    this.productService.deleteProduct(record.id).then(() => {
      console.log('Product deleted!');
    }).catch(error => {
      console.error('Error deleting product:', error);
    });
  }


}
