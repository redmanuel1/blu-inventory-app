import { Timestamp } from "firebase/firestore";

export interface Inventory {
  id: string;
  productCode: string;
  code: string;
  name: string;
  quantity: number;
  dateUpdated?: Timestamp;
  price?: number;
  imgURL?: string[];
  size?: string;
}

export interface GroupedInventoryVariant extends Omit<Inventory, 'size' | 'quantity'> {
  quantity?: number; 
  sizes?: { size: string; quantity: number; id: string[] }[]; // Use string[] for ids
}

export interface Variant {
  code: string;
  name: string;
  price?: number;
  quantity?: number;
  sizes?: { size: string; quantity: number; id: string[] }[]; // Updated to include ids as string[]
  imgURL?: string[];
  id: string
}

// Updated Size interface to ensure ids is always an array
export interface Size {
  size: string;
  quantity: number;
  id: string[]; // Always an array of IDs
}
