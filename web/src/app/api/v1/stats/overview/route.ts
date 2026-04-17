import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/queries/stats";

export const runtime = "nodejs";
export const revalidate = 604800;

export async function GET() {
  try {
    const data = await getOverviewStats();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
