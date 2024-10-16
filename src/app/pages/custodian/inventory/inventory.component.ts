import { Component } from '@angular/core';
import { Inventory } from 'src/app/models/inventory.model';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { TableService } from 'src/app/services/util/table.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
  sortOrder: string[] = ["code", "name", "size", "productCode", "price", "isSet", "quantity", "dateUpdated"]
  dataColumns: TableColumn[] = []
  inventory: Inventory[];
  selectedFiles: { record: any; file: File; imgPreviewURL: string }[] = [];

  fieldConfig: TableColumn[] = [
    { field: "code", type: ColumnType.text, hidden: false, required: true, editable: false },
    { field: "name", type: ColumnType.text, hidden: false, required: true, editable: true },
    { field: "size", type: ColumnType.text, hidden: false, required: false, editable: false },
    { field: "productCode", type: ColumnType.dropdown, hidden: false, required: true, editable: false, tableRef: "Products", fieldRef: "code"},
    { field: "price", type: ColumnType.number, hidden: false, required: true, editable: true },
    { field: "isSet", type: ColumnType.checkbox, hidden: true, editable: false },
    { field: "dateUpdated", type: ColumnType.date, hidden: false, required: true, editable: false , insert: false },
    { field: "quantity", type: ColumnType.number, hidden: false, required: true, editable: true }
  ];


  constructor(private recordService: FirestoreService, private tableService: TableService) {
    recordService.collectionName = "Inventory"
  }

  ngOnInit() {
    this.recordService.getRecords().subscribe(data => {
      // this.inventory = data;
      this.inventory = this.formatInventoryData(data);
      // this.dataColumns = this.tableService.sortDataSet(this.sortOrder, this.tableService.generateDataColumns(this.products));

      this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));

      console.log(data);
      console.log(this.inventory);
      console.log(this.dataColumns);
    });
  }

  formatInventoryData(products: any[]): any[] {
    // return products.map(product => {
    //   return product.variants.map(variant => {
    //     return {
    //       code: variant.code,
    //       name: variant.name,
    //       price: variant.price,
    //       productCode: product.productCode, // productCode from the main object
    //       isSet: product.isSet,             // isSet from the main object
    //       dateUpdated: product?.dateUpdated ? new Date(product.dateUpdated?.seconds * 1000) : "", // convert Firestore timestamp to Date
    //       quantity: variant.quantity             // quantity from the variant
    //     };
    //   });
    // }).flat(); // Flatten the array of arrays
    return products.flatMap(product => 
      product.variants.flatMap(variant => {
        // Check if sizes exist and are not empty
        if (variant.sizes && variant.sizes.length > 0) {
          return variant.sizes.map(sizeInfo => ({
            code: variant.code,
            name: variant.name,
            price: variant.price,
            productCode: product.productCode, // productCode from the main object
            isSet: product.isSet,             // isSet from the main object
            dateUpdated: product?.dateUpdated ? new Date(product.dateUpdated?.seconds * 1000) : "", // convert Firestore timestamp to Date
            size: sizeInfo?.size,              // Extracting size from sizes array
            quantity: sizeInfo?.quantity        // Extracting quantity from sizes array
          }));
        } else {
          // If sizes are not available, return a default object
          return [{
            code: variant.code,
            name: variant.name,
            price: variant.price,
            productCode: product.productCode,
            isSet: product.isSet,
            dateUpdated: product?.dateUpdated ? new Date(product.dateUpdated?.seconds * 1000) : "",
            size: null,                       // Set size to null if not available
            quantity: variant.quantity                    // Set quantity to null if not available
          }];
        }
      })
    );
  }
}
