export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxPercentage: number;
}

export interface Invoice {
  _id: string;
  userId: string;
  logoUrl: string;
  invoiceNumber: string;
  from: string;
  billTo: string;
  shipTo: string;
  invoiceDate: Date;
  paymentTerms: string;
  dueDate: Date;
  poNumber: number;
  items: InvoiceItem[];
  taxPercentage: number;
  discountPercentage: number;
  shippingAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
  terms: string;
  currency: "USD" | "EUR" | "GBP" | "NGN" | "KES" | "GHS" | "ZAR" | "INR";
}
