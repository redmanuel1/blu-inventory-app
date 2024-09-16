export interface CartItem {
    productCode: string;
    name: string;
    size?: string;  
    quantity: number;
    price: number;
    total: number; 
    variantName: string;
  }