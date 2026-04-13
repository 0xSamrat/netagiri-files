import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listPoliticians } from "@/lib/queries/politicians";

export const runtime = "nodejs";
export const revalidate = 3600;

const schema = z.object({
  party: z.string().optional(),
  state: z.string().optional(),
  crime_type: z.enum(["all", "serious"]).optional(),
  sort: z.enum(["total_cases", "serious_cases", "assets", "name"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const q = parsed.data;
  try {
    const data = await listPoliticians({
      house: "rajya_sabha",
      party: q.party,
      state: q.state,
      crimeType: q.crime_type,
      sort: q.sort,
      page: q.page,
      pageSize: q.page_size,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
