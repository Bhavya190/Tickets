import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requesters = await prisma.requester.findMany({
      orderBy: { email: 'asc' }
    });
    return NextResponse.json(requesters);
  } catch (error) {
    console.error("Fetch Requesters Error:", error);
    return NextResponse.json({ error: "Failed to fetch requesters" }, { status: 500 });
  }
}
