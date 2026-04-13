import { NextResponse } from "next/server";
import { getPartyStats } from "@/lib/queries/stats";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getPartyStats("lok_sabha");
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
