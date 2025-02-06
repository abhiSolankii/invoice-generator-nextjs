import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/config/dbConfig";
import Invoice from "@/lib/models/invoice"; // Adjust the import path as needed
import { authMiddleware } from "@/middleware/authMiddleware";
import { fileUploader } from "@/utils/fileUploader";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    const { id } = params;
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch invoice', details: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  await connectDB();

  try {
    const formData = await request.formData();
    
    // Handle file upload
    let fileUrl;
    const file = formData.get('image') as File;
    if (file) {
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
      fileUrl = await fileUploader(buffer, file.name);
    }

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
        amount: Number(formData.get(`items[${index}][amount}`)),
        taxPercentage: Number(formData.get(`items[${index}][taxPercentage}`))
      });
      
      index++;
    }

    const userId = (request as any).user.userId;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        userId,
        logoUrl: fileUrl || formData.get('logoUrl')?.toString().trim(),
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
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invoice updated', invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update invoice', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  await connectDB();

  try {
    const { id } = params;
    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invoice deleted', invoice: deletedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete invoice', details: error.message }, { status: 500 });
  }
}