import { ToggleComponent } from './../forms/toggle/toggle.component';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TableColumn, ColumnType } from 'src/app/models/util/table.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() theme: string = "primary" // css purpose only
  
  @Input() title: string = 'Table Title'
  @Input() dataColumns: TableColumn[]
  @Input() data: any[]

  ColumnType = ColumnType
  showAddRow = false
  hasChanges = false
  newRecords: any[] = []; // array to hold multiple new rows

  ngOnInit() {
    console.log(this.data);
  }

  // Method to add a new empty row
  addRow() {
    // Add a new row for input
    const newRow = {}; // Initialize based on your model
    this.newRecords.push(newRow);
    this.showAddRow = true; // Optionally show the input row
    this.hasChanges = true;
  }

  // Method to remove a specific new row
  removeNewRow(row: any) {
    this.newRecords = this.newRecords.filter(r => r !== row); // Filter out the specific row
    if (this.newRecords.length === 0) {
      this.hasChanges = false; // Reset flag if there are no new rows
    }
  }

  // Method to edit a record
  editRow(item: any) {
    // Set the row to edit mode
    item.isEditing = true;
    this.hasChanges = true;
  }


  // Method to save all new records
  saveAll() {
    // Implement your logic to save all newRecords, for example:
    // this.data.push(...this.newRecords); // Save new records to your main data
    // Clear newRecords after saving if needed
    this.newRecords = []; // Clear the array after saving
    this.hasChanges = false;
  }

  // Method to remove a record
  removeRow(item: any) {
    this.data = this.data.filter(i => i !== item); // Remove the item from data
    this.hasChanges = true; // Set the flag to true when an item is deleted
  }

  onImageChange(event: any) {
    // Your image change handling logic
  }
}
