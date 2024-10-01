export interface Transaction {
  id?: string;
  confirmedDate: string;
  orderNo: string;
  status: string;
  type: string,
  documents?: TransactionDocument;
  // Add other properties as needed
}

export interface TransactionDocument {
  url: string
  uploadDate: string
  name: string
}