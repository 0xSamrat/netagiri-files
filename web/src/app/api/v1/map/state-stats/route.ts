import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStateStats } from "@/lib/queries/stats";

export const runtime = "nodejs";
export const revalidate = 604800;

const schema = z.object({
  house: z.literal("lok_sabha").default("lok_sabha"),
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const data = await getStateStats(parsed.data.house);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
