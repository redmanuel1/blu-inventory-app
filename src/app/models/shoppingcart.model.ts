
export interface CartItem {
    cartID?: number,
    idNo: string,
    orderDate: string,
    productCode: string,
    variantCode: string,
    price: number,
    totalPrice: number,
    imgURL: any[], 
    size?: string,
    quantity: number,
    name: string,
    selected?: boolean,
    maxQuantity?: number,
    productName? : string,
    inventoryID?: string[];
    lowestQuantity?: number;
  }
