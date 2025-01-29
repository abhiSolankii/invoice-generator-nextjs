import connectDB from "@/lib/config/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/user";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!; // Ensure you have a JWT_SECRET in your .env.local file

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { email, password } = await request.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Set the cookie
    const response = NextResponse.json({ message: 'Login successful', user: { email: user.email, name: user.name } });
    response.cookies.set('token', token);

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to login', details: error.message }, { status: 500 });
  }
}