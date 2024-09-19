import { Injectable } from '@angular/core';
import { ColumnType, TableColumn } from 'src/app/models/util/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() { }

  generateDataColumns(data: any[]): TableColumn[] {
    if (data.length === 0) return [];

    const columns = this.extractColumns(data);
    return columns;
  }

  private extractColumns(data: any[]): TableColumn[] {
    const columnsSet = new Set<string>();

    data.forEach(item => {
      this.collectFields(item, columnsSet);
    });

    return Array.from(columnsSet)
    .filter(field => !field.includes('.'))  // Exclude fields with a dot
    .map(field => ({
      field,
      header: this.capitalizeFirstLetter(field),
      type: this.detectFieldType(data[0][field]),
      sortable: true,
      filterable: true
    }));
  }

  private collectFields(obj: any, columnsSet: Set<string>, parentKey: string = ''): void {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      columnsSet.add(fullKey);

      if (Array.isArray(obj[key])) {
        obj[key].forEach(item => this.collectFields(item, columnsSet, fullKey));
      } else if (typeof obj[key] === 'object') {
        this.collectFields(obj[key], columnsSet, fullKey);
      }
    });
  }

  detectFieldType(value: any): ColumnType {
    if (Array.isArray(value)) {
      return ColumnType.custom;  // You might use 'custom' for arrays, or define another type
    } else if (typeof value === 'object' && value !== null) {
      return ColumnType.custom;  // You might use 'custom' for objects, or define another type
    } else if (typeof value === 'boolean') {
      return ColumnType.checkbox;
    } else if (typeof value === 'number') {
      return ColumnType.number;
    } else if (value instanceof Date) {
      return ColumnType.date;  // Assuming you handle date fields this way
    } else {
      return ColumnType.string; // Default to string
    }
  }
  // Helper function to capitalize the first letter of the field name for display purposes
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  sortDataSet(sortOrder: any[] ,dataSet) {
    return dataSet.sort((a, b) => {
      return sortOrder.indexOf(a.field) - sortOrder.indexOf(b.field);
    }
  );
  }
}
