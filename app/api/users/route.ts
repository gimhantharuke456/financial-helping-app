import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { userSchema } from "@/schemas/user.schema";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Create a new user
export async function POST(request: Request) {
  const body = await request.json();
  const validation = userSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { email, username, password } = validation.data;

  // Check if user already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUserByEmail) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 }
    );
  }

  const existingUserByUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUserByUsername) {
    return NextResponse.json(
      { error: "Username already in use" },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...validation.data,
      password: hashedPassword,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

// Get all users
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users, { status: 200 });
}
