export interface Transaction {
  id?: string;
  confirmedDate: string;
  orderNo: string;
  status: string;
  type: string;
  documents?: TransactionDocument[];
  comments?: TransactionComment[];
}

export interface TransactionDocument {
  url: string;
  uploadDate: string;
}

export interface TransactionComment{
  comment: string;
  commentDate: string;
  user: string;
}
