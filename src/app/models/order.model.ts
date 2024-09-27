export interface Order {
    idNo: string,
    orderDate: Date,
    orderNo: string,
    products: OrderProduct[],
    totalPrice: number
  }
export interface OrderProduct {
  price: number,
  productCode: string,
  quantity: number,
  size: string,
  variantCode: string
}