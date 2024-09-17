export interface Orders {
    productCode: string;
    name: string;
    size?: string;  
    quantity: number;
    price: number;
    total: number; 
    variantName: string;
    idNo?: string;
    date: Date;
    status: string;
  }