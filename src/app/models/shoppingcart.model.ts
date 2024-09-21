
export interface CartItem {
    idNo: string,
    orderDate: string,
    productCode: string,
    variantCode: string,
    price: number,
    totalPrice: number,
    imgURL?: string, 
    size?: string,
    quantity: number,
    name: string,
    selected?: boolean
  }