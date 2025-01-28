import connectDB from "@/lib/config/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/lib/models/invoice"; // Adjust the import path as needed

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const data = await request.json();
    const newInvoice = new Invoice(data);
    const savedInvoice = await newInvoice.save();
    return NextResponse.json({ message: 'Invoice created', invoice: savedInvoice });
  } catch (error:any) {
    return NextResponse.json({ error: 'Failed to create invoice', details: error.message }, { status: 500 });
  }
}