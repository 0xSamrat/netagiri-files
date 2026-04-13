import { NextResponse } from "next/server";
import { getBubbleData } from "@/lib/queries/politicians";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getBubbleData("rajya_sabha");
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
