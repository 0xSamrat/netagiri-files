import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listPoliticians } from "@/lib/queries/politicians";

export const runtime = "nodejs";
export const revalidate = 3600;

const schema = z.object({
  house: z.literal("lok_sabha").default("lok_sabha"),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const parsed = schema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const q = parsed.data;
  try {
    const data = await listPoliticians({
      house: q.house,
      state: code.toUpperCase(),
      page: q.page,
      pageSize: q.page_size,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
