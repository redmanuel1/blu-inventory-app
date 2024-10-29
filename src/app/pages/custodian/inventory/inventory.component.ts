import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
import { Inventory } from 'src/app/models/inventory.model';
import { TableService } from 'src/app/services/util/table.service';
import { finalize } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastComponent } from 'src/app/components/modal/toast/toast.component';
import { ToastService } from 'src/app/components/modal/toast/toast.service';
import { forEach } from 'lodash';
import { WhereFilterOp } from 'firebase/firestore';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'] // Fixed typo here from `styleUrl` to `styleUrls`
})
export class InventoryComponent implements OnInit {
  sortOrder: string[] = ["imgURL", "productCode", "code", "name", "size", "price", "quantity", "dateUpdated"];
  dataColumns: TableColumn[] = [];
  inventory: Inventory[] = [];
  selectedFiles: { record: any; files: File[]; imgPreviewURLs: string[] }[] = [];
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  fieldConfig: TableColumn[] = [
    { field: "imgURL", type: ColumnType.image, hidden: false, required: false, editable: false },
    { field: "productCode", type: ColumnType.dropdown, hidden: false, required: true, editable: false, tableRef: "Products", fieldRef: "code",  css: { width: '150px'  }},
    { field: "code", type: ColumnType.text, hidden: false, required: true, editable: false, css: { width: '100px' } },
    { field: "name", type: ColumnType.text, hidden: false, required: true, editable: true,  css: { width: '250px'  }},
    { field: "size", type: ColumnType.text, hidden: false, required: false, editable: true, css: { width: '100px' }  },
    { field: "price", type: ColumnType.number, hidden: false, required: true, editable: true,  css: { width: '100px' }},
    // { field: "isSet", type: ColumnType.checkbox, hidden: true, required: false, editable: false },
    { field: "dateUpdated", type: ColumnType.date, hidden: false, required: false, editable: false, insert: false },
    { field: "quantity", type: ColumnType.number, hidden: false, required: true, editable: true,  css: { width: '100px' } }
    // { field: "lowStockQty", type: ColumnType.number, hidden: false, required: false, editable: true,  css: { width: '100px' }}
  ];

  constructor(
    private recordService: FirestoreService,
    private tableService: TableService,
    private storage: AngularFireStorage,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
  ) {
    recordService.collectionName = "Inventory";
  }

  ngOnInit() {
    this.spinner.show()
    this.recordService.getRecords().subscribe(data => {
      this.inventory = data.sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
      this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));
      this.spinner.hide()
    });
  }

  ngAfterViewInit() {
    this.toastService.registerToast(this.toastComponent);
  }

  async saveInventory(records: any[]) {
    this.spinner.show();
    
    const uploadPromises = records.map(record => {
      const selectedFiles = this.selectedFiles
        .filter(file => file.record.code === record.code)
        .flatMap(file => file.files);
  
      if (selectedFiles.length > 0) {
        return this.uploadImages(selectedFiles, record);
      }
      return Promise.resolve(); // No upload needed
    });
  
    try {
      await Promise.all(uploadPromises); // Wait for all uploads to finish
  
      const { updates, newRecords } = records.reduce((acc, record) => {
        const { isEditing, imgPreviewURLs, ...filteredRecord } = record; // Remove imgPreviewURLs before saving
  
        filteredRecord.price = Number(filteredRecord.price);
        filteredRecord.quantity = Number(filteredRecord.quantity);
        filteredRecord.dateUpdated = new Date().toISOString(); // Set current timestamp
  
        if (isEditing) {
          acc.updates.push(filteredRecord);
        } else {
          acc.newRecords.push(filteredRecord);
        }
  
        return acc;
      }, { updates: [] as Inventory[], newRecords: [] as Inventory[] });

      this.recordService.collectionName = 'Inventory'
      // Handle updates for existing records
      if (updates.length) {
        this.recordService.collectionName = "Inventory";
        await this.recordService.updateRecords(updates);
        this.hideSpinnerAddToast('Updated inventory saved!', "success");
      }
  
      // Handle new records and duplicates
      const recordTobeAdded: Inventory[] = [];
      const duplicateRecords: Inventory[] = [];
     
  
      for (const record of newRecords) {
        const conditions: { field: string; operator: WhereFilterOp; value: any }[] = [
          { field: 'code', operator: '==', value: record.code },
          { field: 'productCode', operator: '==', value: record.productCode },
          { field: 'size', operator: '==', value: record.size }
        ];
  
        // Check if a duplicate record exists
        const duplicateExists = await this.recordService.getRecordByFields(conditions);
  
        if (duplicateExists.length === 0) {
          // If no duplicate is found, add it to newRecords
          recordTobeAdded.push(record);
        } else {
          // If a duplicate is found, retrieve the existing quantity
          duplicateExists.forEach(doc => {
            const existingData = doc.data as Inventory;
            existingData.id = doc.id;
            const updatedQuantity = (existingData.quantity || 0) + (record.quantity || 0);
  
            // Prepare duplicate record for updating
            duplicateRecords.push({
              ...existingData,
              quantity: updatedQuantity, // Use updated quantity
            });
          });
        }
      }
  
      // Add new records to Firestore
      if (recordTobeAdded.length) {
        await this.recordService.addRecords(recordTobeAdded);
        this.hideSpinnerAddToast('New inventory saved!', "success");
      }
  
      // Update duplicate records if any
      if (duplicateRecords.length) {
        await this.recordService.updateRecords(duplicateRecords);
        this.hideSpinnerAddToast('Duplicate inventory updated!', "success");
      }
  
    } catch (error) {
      this.hideSpinnerAddToast('Error processing inventory: ' + error, "error");
    }
  }
  

  deleteInventory(record: any) {
    this.recordService.collectionName = 'Inventory'
    this.recordService.deleteRecord(record.id).then(() => {
      this.hideSpinnerAddToast('Inventory deleted : ' + record.name,"success");
    }).catch(error => {
      this.hideSpinnerAddToast('Error deleting product ' + record.name + " : " + error, "error");
    });
  }

  handleImageSelection(event: { record: any; files: File[]; imgPreviewURLs: string[] }) {
    this.selectedFiles.push(event);
  }

  // Modified method to handle multiple image uploads
  uploadImages(files: File[], record: any): Promise<void> {
    // Ensure that imgURLs is initialized as an empty array if not already present
    if (!record.imgURL) {
      record.imgURL = [];
    }
  
    const uploadTasks = files.map(file => {
      return new Promise<void>((resolve, reject) => {
        const filePath = `products/${file.name}`; // Adjust the path as needed
        const task = this.storage.upload(filePath, file);
  
        task.snapshotChanges().pipe(
          finalize(() => {
            this.storage.ref(filePath).getDownloadURL().subscribe(url => {
              // Append each URL to the imgURLs array (ensure it's not overwritten)
              record.imgURL.push(url);
              resolve(); // Resolve once the image URL is added
            }, reject); // Handle error
          })
        ).subscribe();
      });
    });
  
    // Wait until all image uploads are finished
    return Promise.all(uploadTasks).then(() => {
      console.log('All images uploaded and URLs added to the record');
    }).catch(error => {
      console.error('Error uploading one or more images:', error);
    });
  }
  

  hideSpinnerAddToast(message, status) {
    this.spinner.hide();
    this.toastService.showToast(message, status);
  }

}
