export enum ColumnType {
  hidden = 'hidden',
  custom = 'custom',
  string = 'string',
  text = 'text',
  number = 'number',
  date = 'date',
  range = 'range',
  checkbox = 'checkbox',
  dropDown = 'dropdown',
}

export interface TableColumn {
  field: string; // keyof T; // it's not keyof T, because it can be dot-notation like user.location.id
  header?: string;
  type?: ColumnType;
  hidden?: boolean;
  editable?: boolean; 
  sortable?: boolean; // Defaults to true
  filterable?: boolean; // Defaults to true
}