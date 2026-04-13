import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchPoliticians } from "@/lib/queries/politicians";

export const runtime = "nodejs";

const schema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const data = await searchPoliticians(parsed.data.q, parsed.data.limit);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
