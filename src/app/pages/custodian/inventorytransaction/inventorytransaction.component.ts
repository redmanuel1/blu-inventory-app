import { InventoryTransaction } from './../../../models/inventory-transaction.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Component, OnInit } from '@angular/core';
import { TableColumn, ColumnType } from 'src/app/models/util/table.model';
import { NgxSpinnerService } from "ngx-spinner";
import { TableService } from 'src/app/services/util/table.service';

@Component({
  selector: 'app-inventorytransaction',
  templateUrl: './inventorytransaction.component.html',
  styleUrl: './inventorytransaction.component.scss'
})
export class InventorytransactionComponent implements OnInit{

  inventoryTransactions:InventoryTransaction[] = []
  sortOrder: string[] = [
    "productCode",
    "quantity",
    "inOrOut",
    "receivedFromOrGivenTo",
    "remarks",
    "transactionDate"
  ];
  fieldConfig: TableColumn[] = [
    { field: "productCode", type: ColumnType.text, hidden: false, editable: false },
    { field: "quantity", type: ColumnType.number, hidden: false, required: true, editable: false,},
    { field: "inOr  Out", type: ColumnType.text, hidden: false, required: true,editable: false,},
    { field: "receivedFromOrGivenTo", type: ColumnType.text, hidden: true, editable: false },
    { field: "remarks", type: ColumnType.text, hidden: true, editable: false },
    { field: "transactionDate", type: ColumnType.date, hidden: false, required: true, editable: false,}
  ];
  dataColumns: TableColumn[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private spinnerService: NgxSpinnerService,
    private tableService: TableService,
  ){
    firestoreService.collectionName = "InventoryTransaction"
  }
  ngOnInit(): void {
    this.spinnerService.show()
    this.firestoreService.getRecords().subscribe((data)=>{
      this.inventoryTransactions = data.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
    })
    this.spinnerService.hide()
    this.dataColumns = this.sortOrder.map((fieldName) =>
      this.tableService.createTableColumn(fieldName, this.fieldConfig)
    );
  }
}
