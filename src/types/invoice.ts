export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxAmount?: number;
  taxPercentage?: number;
}

export interface InvoiceData {
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
  taxAmount?: number;
  taxPercentage?: number;
  discountAmount?: number;
  discountPercentage?: number;
  shippingAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
  terms: string;
  currency: "USD" | "EUR" | "GBP" | "NGN" | "KES" | "GHS" | "ZAR" | "INR";
}
