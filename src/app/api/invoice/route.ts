import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/config/dbConfig";
import Invoice from "@/lib/models/invoice";
import { authMiddleware } from "@/middleware/authMiddleware";
import { uploadMiddleware } from "@/middleware/uploadMiddleware";
import { fileUploader } from "@/utils/imageUploader";

// Helper function to handle middleware
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function POST(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  await connectDB();

  try {
    // Parse the form data using uploadMiddleware
    const req = request as any;
    const res = NextResponse.next();
    await runMiddleware(req, res, uploadMiddleware);

    const file = req.file;

    // Upload the file to S3
    const fileUrl = await fileUploader(file.buffer, file.originalname);

    // Extract other fields from the form data
    const {
      invoiceNumber,
      from,
      billTo,
      shipTo,
      invoiceDate,
      paymentTerms,
      dueDate,
      poNumber,
      items,
      taxAmount,
      taxPercentage,
      discountAmount,
      discountPercentage,
      shippingAmount,
      totalAmount,
      amountPaid,
      balanceDue,
      notes,
      terms,
      currency
    } = req.body;

    const userId = req.user.userId;

    const newInvoice = new Invoice({
      userId,
      logoUrl: fileUrl,
      invoiceNumber,
      from,
      billTo,
      shipTo,
      invoiceDate,
      paymentTerms,
      dueDate,
      poNumber,
      items: JSON.parse(items),
      taxAmount,
      taxPercentage,
      discountAmount,
      discountPercentage,
      shippingAmount,
      totalAmount,
      amountPaid,
      balanceDue,
      notes,
      terms,
      currency
    });

    const savedInvoice = await newInvoice.save();
    return NextResponse.json({ message: 'Invoice created', invoice: savedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create invoice', details: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  await connectDB();

  try {
    const userId = (request as any).user.userId;
    const invoices = await Invoice.find({ userId });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch invoices', details: error.message }, { status: 500 });
  }
}