export interface Product {
  imageUrl?: string, // not required
  code: string,
  name: string,
  Variants: Variant[],
  isSet: boolean,
  price: number
}

export interface Variant {
  name: string,
  price: number,
  quantity?: number,
  size?: Size[]
}

export interface Size {
  name: string,
  quantity: number
}