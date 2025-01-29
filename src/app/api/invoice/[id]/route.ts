import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/config/dbConfig";
import Invoice from "@/lib/models/invoice"; // Adjust the import path as needed
import { authMiddleware } from "@/middleware/authMiddleware";

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
    const { id } = params;
    const {
      logoUrl,
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
    } = await request.json();

    const userId = (request as any).user.userId;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        userId,
        logoUrl,
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