import { Timestamp } from "firebase/firestore";


export interface Inventory {
  productCode: string;
  variants?: Variant[];
  isSet: boolean;
  dateUpdated: Timestamp;
}

export interface Variant {
  code: string;
  name: string;
  price?: number;
  quantity: number;
  sizes?: Size[];
}

export interface Size {
  size: string;
  quantity: number;
}
