import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit } from '@angular/core';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';
import { Inventory } from 'src/app/models/inventory.model';
import { TableService } from 'src/app/services/util/table.service';
import { finalize } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'] // Fixed typo here from `styleUrl` to `styleUrls`
})
export class InventoryComponent implements OnInit {
  sortOrder: string[] = ["imgURL", "productCode", "code", "name", "size", "price", "isSet", "quantity", "dateUpdated", "lowStockQty"];
  dataColumns: TableColumn[] = [];
  inventory: Inventory[] = [];
  selectedFiles: { record: any; files: File[]; imgPreviewURLs: string[] }[] = [];

  fieldConfig: TableColumn[] = [
    { field: "imgURL", type: ColumnType.image, hidden: false, required: false, editable: false },
    { field: "productCode", type: ColumnType.dropdown, hidden: false, required: true, editable: false, tableRef: "Products", fieldRef: "code",  css: { width: '100px'  }},
    { field: "code", type: ColumnType.text, hidden: false, required: true, editable: false },
    { field: "name", type: ColumnType.text, hidden: false, required: true, editable: true,  css: { width: '250px'  }},
    { field: "size", type: ColumnType.text, hidden: false, required: false, editable: true, css: { width: '100px' }  },
    { field: "price", type: ColumnType.number, hidden: false, required: true, editable: true,  css: { width: '100px' }},
    { field: "isSet", type: ColumnType.checkbox, hidden: true, required: false, editable: false },
    { field: "dateUpdated", type: ColumnType.date, hidden: false, required: false, editable: false, insert: false },
    { field: "quantity", type: ColumnType.number, hidden: false, required: true, editable: true,  css: { width: '100px' } },
    { field: "lowStockQty", type: ColumnType.number, hidden: false, required: false, editable: true,  css: { width: '100px' }}
  ];

  constructor(
    private recordService: FirestoreService,
    private tableService: TableService,
    private storage: AngularFireStorage
  ) {
    recordService.collectionName = "Inventory";
  }

  ngOnInit() {
    this.recordService.getRecords().subscribe(data => {
      this.inventory = this.formatInventoryData(data);
      this.dataColumns = this.sortOrder.map(fieldName => this.tableService.createTableColumn(fieldName, this.fieldConfig));
      console.log(data);
      console.log(this.inventory);
      console.log(this.dataColumns);
    });
  }

  saveInventory(records: any[]) {
    console.log(records)
    const formattedData = this.savingFormatInventoryData(records);
    const uploadPromises = formattedData.map(record => {
      const selectedFiles = this.selectedFiles
        .filter(file => file.record.productCode === record.productCode)
        .flatMap(file => file.files);

      if (selectedFiles && selectedFiles.length) {
        return this.uploadImages(selectedFiles, formattedData);
      }
      return Promise.resolve(); // No upload needed
    });

    Promise.all(uploadPromises).then(() => {
      const { updates, newRecords } = formattedData.reduce((acc, record) => {
        const { isEditing, imgPreviewURLs, ...filteredRecord } = record; // Remove imgPreviewURLs before saving
        console.log(filteredRecord)
        if (isEditing) {
          acc.updates.push(filteredRecord);
        } else {
          acc.newRecords.push(filteredRecord);
        }

        return acc;
      }, { updates: [], newRecords: [] });

      if (updates.length) {
        this.recordService.collectionName = "Inventory";
        this.recordService.updateRecords(updates).then(() => {
          console.log('Updated inventory saved!');
        }).catch(error => {
          console.error('Error updating inventory:', error);
        });
      }

      if (newRecords.length) {
        this.recordService.collectionName = "Inventory";
        this.recordService.addRecords(newRecords).then(() => {
          console.log('New inventory saved!');
        }).catch(error => {
          console.error('Error saving new inventory:', error);
        });
      }
    }).catch(error => {
      console.error('Error uploading images:', error);
    });
  }

  deleteInventory(record: any) {
    this.recordService.deleteRecord(record.id).then(() => {
      console.log('Inventory item deleted!');
    }).catch(error => {
      console.error('Error deleting inventory item:', error);
    });
  }

  handleImageSelection(event: { record: any; files: File[]; imgPreviewURLs: string[] }) {
    this.selectedFiles.push(event);
  }

  async uploadImages(files: File[], records: any[]): Promise<void> {
    const uploadTasks = records.map(record => {
        // Create an array of upload tasks for each variant in the current record
        const variantUploadTasks = record.variants.map(variant => {
            return files.map(file => {
                return new Promise<void>((resolve, reject) => {
                    const filePath = `inventory/${record.productCode}/${variant.code}/${file.name}`; // Using productCode and variant code in path
                    const task = this.storage.upload(filePath, file);

                    task.snapshotChanges().pipe(
                        finalize(() => {
                            this.storage.ref(filePath).getDownloadURL().subscribe(url => {
                                // Initialize imgURL if it doesn't exist
                                variant.imgURL = variant.imgURL || [];
                                variant.imgURL.push(url); // Push the new URL to the variant's imgURL
                                resolve();
                            }, reject);
                        })
                    ).subscribe();
                });
            });
        }).flat(); // Flatten to create a single array of promises for all file uploads for all variants

        // Wait for all uploads for the current record's variants to complete
        return Promise.all(variantUploadTasks).then(() => {
            console.log(`All images uploaded for product code: ${record.productCode}`);
        });
    });

    // Wait for all upload tasks for all records to complete
    return Promise.all(uploadTasks).then(() => {
        console.log('All images uploaded for all records');
    }).catch(error => {
        console.error('Error uploading one or more images:', error);
    });
}


  formatInventoryData(products: any[]): any[] {
    return products.flatMap(product => 
      product.variants.flatMap(variant => {
        if (variant.sizes && variant.sizes.length > 0) {
          return variant.sizes.map(sizeInfo => ({
            imgURL: variant.imgURL,
            code: variant.code,
            name: variant.name,
            price: variant.price,
            productCode: product.productCode,
            isSet: product.isSet,
            dateUpdated: product?.dateUpdated ? new Date(product.dateUpdated?.seconds * 1000) : "",
            size: sizeInfo?.size,
            quantity: sizeInfo?.quantity,
            lowStockQty: sizeInfo?.lowStockQty ?? 0
          }));
        } else {
          return [{
            imgURL: variant.imgURL,
            code: variant.code,
            name: variant.name,
            price: variant.price,
            productCode: product.productCode,
            isSet: product.isSet,
            dateUpdated: product?.dateUpdated ? new Date(product.dateUpdated?.seconds * 1000) : "",
            quantity: variant.quantity,
            lowStockQty: variant.lowStockQty ?? 0,
          }];
        }
      })
    );
  }

  savingFormatInventoryData(inventory: any[]) {
    // Create a map to group products by their product code
    const productMap = new Map<string, any>();
  
    inventory.forEach(item => {
      const { productCode, code, imgPreviewURLs, name, price, size, quantity, lowStockQty } = item;
  
      // Create a product entry if it doesn't exist
      if (!productMap.has(productCode)) {
        productMap.set(productCode, {
          isSet: true,  // Set this value based on your logic
          productCode: productCode,
          dateUpdated: new Date(),
          variants: []
        });
      }
  
      // Get the product entry from the map
      const product = productMap.get(productCode);
  
      // Check if the variant already exists
      let variant = product.variants.find(v => v.code === code);
      
      // If variant doesn't exist, create a new one
      if (!variant) {
        variant = {
          code: code,
          imgURL: [],  // Allow for multiple images
          name: name,
          price: Number(price),  // Convert price to number
          sizes: []
        };
        product.variants.push(variant);
      }
  
      // Add the size and quantity to the variant sizes
      variant.sizes.push({
        size: size,
        quantity: Number(quantity)  // Convert quantity to number
      });
    });
  
    // Convert the map back to an array
    return Array.from(productMap.values());
  }

}
