export interface InventoryTransaction {
  id?: string;
  amount: number;
  inOrOut: InOrOut;
  productCode: string;
  quantity: number;
  receivedFromOrGivenTo: string;
  remarks?: string;
  transactionDate: string;
  transactionId?: string;
}

type InOrOut = "IN" | "OUT";
