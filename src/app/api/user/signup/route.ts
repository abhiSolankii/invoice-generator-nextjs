import connectDB from "@/lib/config/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name, email, password } = await request.json();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return NextResponse.json({ message: "User created", user: savedUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}
