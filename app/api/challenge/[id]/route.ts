import { NextResponse } from "next/server";
import { UpdateChallengeSchema } from "@/schemas/challenge";
import { ObjectId } from "bson";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET challenge by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { message: "Invalid challenge ID" },
      { status: 400 }
    );
  }

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    });

    if (!challenge) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update challenge
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { message: "Invalid challenge ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validation = UpdateChallengeSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  try {
    const updatedChallenge = await prisma.challenge.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE challenge
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { message: "Invalid challenge ID" },
      { status: 400 }
    );
  }

  try {
    await prisma.challenge.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Challenge deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json(
        { message: "Challenge not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
