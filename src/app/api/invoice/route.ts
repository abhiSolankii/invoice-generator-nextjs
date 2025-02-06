import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/config/dbConfig";
import Invoice from "@/lib/models/invoice";
import { fileUploader } from "@/utils/fileUploader";
import { authMiddleware } from "@/middleware/authMiddleware";

export async function POST(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  await connectDB();

  try {
    const formData = await request.formData();
    
    // Handle file upload
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, JPG, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file to S3
    const fileUrl = await fileUploader(buffer, file.name);

    // Extract items array from formData
    const items = [];
    let index = 0;
    while (true) {
      const nameKey = `items[${index}][name]`;
      if (!formData.has(nameKey)) break;

      items.push({
        name: formData.get(`items[${index}][name}`),
        description: formData.get(`items[${index}][description}`),
        quantity: Number(formData.get(`items[${index}][quantity}`)),
        rate: Number(formData.get(`items[${index}][rate}`)),
        taxPercentage: Number(formData.get(`items[${index}][taxPercentage}`)),
        amount: Number(formData.get(`items[${index}][amount}`)),
      });
      
      index++;
    }

    const userId = (request as any).user.userId;

    // Create new invoice
    const newInvoice = new Invoice({
      userId,
      logoUrl: fileUrl,
      invoiceNumber: formData.get('invoiceNumber')?.toString().trim(),
      from: formData.get('from')?.toString().trim(),
      billTo: formData.get('billTo')?.toString().trim(),
      shipTo: formData.get('shipTo')?.toString().trim(),
      invoiceDate: formData.get('invoiceDate') ? new Date(formData.get('invoiceDate').toString().trim()) : undefined,
      paymentTerms: formData.get('paymentTerms')?.toString().trim(),
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate').toString().trim()) : undefined,
      poNumber: Number(formData.get('poNumber')),
      items,
      taxPercentage: Number(formData.get('taxPercentage')),
      discountPercentage: Number(formData.get('discountPercentage')),
      shippingAmount: Number(formData.get('shippingAmount')),
      totalAmount: Number(formData.get('totalAmount')),
      amountPaid: Number(formData.get('amountPaid')),
      balanceDue: Number(formData.get('balanceDue')),
      notes: formData.get('notes')?.toString().trim(),
      terms: formData.get('terms')?.toString().trim(),
      currency: formData.get('currency')?.toString().trim()
    });

    const savedInvoice = await newInvoice.save();
    return NextResponse.json({ message: 'Invoice created', invoice: savedInvoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    );
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