export enum ColumnType {
  hidden = 'hidden',
  custom = 'custom',
  string = 'string',
  text = 'text',
  number = 'number',
  date = 'date',
  range = 'range',
  checkbox = 'checkbox',
  dropdown = 'dropdown',
  image = 'image'
}

export interface TableColumn {
  field: string; // keyof T; // it's not keyof T, because it can be dot-notation like user.location.id
  header?: string;
  type?: ColumnType;
  hidden?: boolean;
  editable?: boolean; 
  insert?: boolean;
  required?: boolean;
  defaultValue?: any;
  tableRef?: string;
  fieldRef?: string;
  css?: any
}