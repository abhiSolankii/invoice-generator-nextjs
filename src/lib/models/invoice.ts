import mongoose from 'mongoose';

const { Schema } = mongoose;

const invoiceSchema = new Schema({
  logoUrl: {
    type: String,
    required: true,
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  billTo: {
    type: String,
    required: true,
  },
  shipTo: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  paymentTerms: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  poNumber: {
    type: Number,
    required: true,
  },
  items: [{
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    taxPercentage: {
      type: Number,
      required: true,
    },
  }],
  taxAmount: {
    type: Number,
  },
  taxPercentage: {
    type: Number,
  },
  discountAmount: {
    type: Number,
  },
  discountPercentage: {
    type: Number,
  },
  shippingAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  balanceDue: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  terms: {
    type: String,
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR'],
    required: true,
  },
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;