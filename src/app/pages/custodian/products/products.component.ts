import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit } from '@angular/core';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
import { Product } from 'src/app/models/product.model';
import { TableService } from 'src/app/services/util/table.service';
import { finalize } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  sortOrder: string[] = ["imgURL", "code", "name", "isSet", "price"];
  dataColumns: TableColumn[] = [];
  products: Product[];
  selectedFiles: { record: any; files: File[]; imgPreviewURLs: string[] }[] = [];

  fieldConfig: TableColumn[] = [
    { field: "imgURL", type: ColumnType.image, hidden: false, editable: true },
    { field: "code", type: ColumnType.text, hidden: false, required: true, editable: false },
    { field: "name", type: ColumnType.text, hidden: false, required: true, editable: true },
    { field: "isSet", type: ColumnType.checkbox, hidden: true, editable: true },
    { field: "price", type: ColumnType.number, hidden: false, required: true, editable: true }
  ];

  constructor(
    private recordService: FirestoreService,
    private tableService: TableService,
    private storage: AngularFireStorage
  ) {
    recordService.collectionName = "Products";
  }

  ngOnInit() {
    this.recordService.getRecords().subscribe(data => {
      this.products = data;
      this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));
      console.log(data);
      console.log(this.dataColumns);
    });
  }

  saveProducts(records: any[]) {
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

        if (isEditing) {
          acc.updates.push(filteredRecord);
        } else {
          acc.newRecords.push(filteredRecord);
        }

        return acc;
      }, { updates: [], newRecords: [] });

      if (updates.length) {
        this.recordService.updateRecords(updates).then(() => {
          console.log('Updated products saved!');
        }).catch(error => {
          console.error('Error updating products:', error);
        });
      }

      if (newRecords.length) {
        this.recordService.addRecords(newRecords).then(() => {
          console.log('New products saved!');
        }).catch(error => {
          console.error('Error saving new products:', error);
        });
      }
    }).catch(error => {
      console.error('Error uploading images:', error);
    });
  }

  deleteProduct(record: any) {
    this.recordService.deleteRecord(record.id).then(() => {
      console.log('Product deleted!');
    }).catch(error => {
      console.error('Error deleting product:', error);
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
  
}
