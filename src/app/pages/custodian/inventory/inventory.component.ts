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
  sortOrder: string[] = ["code", "name", "productCode", "price", "isSet", "dateUpdated", "quantity"]
  dataColumns: TableColumn[] = []
  inventory: Inventory[];
  selectedFiles: { record: any; file: File; imgPreviewURL: string }[] = [];

  fieldConfig: Record<string, { type: ColumnType; hidden?: boolean; editable?: boolean; required?: boolean }> = {
    code: { type: ColumnType.text, hidden: false, required: true, editable: false },
    name: { type: ColumnType.text, hidden: false, required: true, editable: true },
    productCode: { type: ColumnType.dropDown, hidden: false, required: true, editable: true },
    price: { type: ColumnType.number, hidden: false, required: true, editable: true },
    isSet: { type: ColumnType.checkbox, hidden: true, editable: false },
    dateUpdated: { type: ColumnType.date, hidden: false, required: true, editable: true },
    quantity: { type: ColumnType.number, hidden: false, required: true, editable: true }
  };


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
    return products.map(product => {
      return product.variants.map(variant => {
        return {
          code: variant.code,
          name: variant.name,
          price: variant.price,
          productCode: product.productCode, // productCode from the main object
          isSet: product.isSet,             // isSet from the main object
          dateUpdated: new Date(product.dateUpdated?.seconds * 1000), // convert Firestore timestamp to Date
          quantity: variant.quantity             // quantity from the variant
        };
      });
    }).flat(); // Flatten the array of arrays
  }
}
