import { NextResponse } from "next/server";
import { listIpcSections } from "@/lib/queries/stats";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  try {
    const data = await listIpcSections();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
