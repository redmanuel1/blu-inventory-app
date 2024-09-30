export interface Orders {
    idNo: string,
    orderDate: string;
    orderNo: string;
    totalPrice: number;
    products:OrderedProducts[]
  }

  export interface OrderedProducts{
    price: number,
    productCode: string,
    quantity: number,
    size: string,
    variantCode: string,
    itemSubtotal: number
  }