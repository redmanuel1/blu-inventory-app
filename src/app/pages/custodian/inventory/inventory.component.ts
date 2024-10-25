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

  saveInventory(records: any[]) {
    this.spinner.show();
    const uploadPromises = records.map(record => {
      const selectedFiles = this.selectedFiles
      .filter(file => file.record.code === record.code)
      .flatMap(file => file.files);

      if (selectedFiles) {
        return this.uploadImages(selectedFiles, record);
      }
      return Promise.resolve(); // No upload needed
    });

    Promise.all(uploadPromises).then(() => {
      const { updates, newRecords } = records.reduce((acc, record) => {
        const { isEditing, imgPreviewURLs, ...filteredRecord } = record; // Remove imgPreviewURLs before saving

        filteredRecord.dateUpdated =  new Date().toISOString(); // Set current timestamp if dateUpdated is missing
        
        if (isEditing) {
          acc.updates.push(filteredRecord);
        } else {
          acc.newRecords.push(filteredRecord);
        }

        return acc;
      }, { updates: [] as Inventory[], newRecords: [] as Inventory[] });

      if (updates.length) {
        this.recordService.collectionName = "Inventory"
        this.recordService.updateRecords(updates).then(() => {
          this.hideSpinnerAddToast('Updated inventory saved!', "success");
        }).catch(error => {
          this.hideSpinnerAddToast('Error updating inventory: ' + error , "error");
        });
      }

      if (newRecords.length) {
        this.recordService.collectionName = "Inventory"
        this.recordService.addRecords(newRecords).then(() => {
          this.hideSpinnerAddToast('New inventory saved!', "success");
        }).catch(error => {
          this.hideSpinnerAddToast('Error saving new inventory: ' + error,"error");
        });
      }
    }).catch(error => {
      this.hideSpinnerAddToast('Error uploading images: ' + error, "error");
    });
  }

  deleteInventory(record: any) {
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
