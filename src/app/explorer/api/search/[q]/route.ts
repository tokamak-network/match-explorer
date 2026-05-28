import { NextResponse } from "next/server";
import { repo } from "@/lib/explorer";

export const dynamic = "force-dynamic";

type Params = Promise<{ q: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { q } = await params;
  const decoded = decodeURIComponent(q ?? "");
  const hits = await repo.search(decoded, 8);
  return NextResponse.json(hits);
}
