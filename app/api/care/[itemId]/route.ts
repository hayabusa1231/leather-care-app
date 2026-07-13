import { NextRequest, NextResponse } from "next/server";
import { addCareRecord, deleteCareRecord } from "@/lib/careStorage";
import { CARE_ITEMS, type CareItemId } from "@/lib/careTypes";

type Params = { params: Promise<{ itemId: string }> };

function isValidItemId(id: string): id is CareItemId {
  return CARE_ITEMS.some((item) => item.id === id);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { itemId } = await params;
  if (!isValidItemId(itemId)) {
    return NextResponse.json({ error: "不明なアイテムです" }, { status: 404 });
  }
  const data = await addCareRecord(itemId, todayStr());
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { itemId } = await params;
  if (!isValidItemId(itemId)) {
    return NextResponse.json({ error: "不明なアイテムです" }, { status: 404 });
  }
  const { date } = await request.json();
  if (typeof date !== "string") {
    return NextResponse.json({ error: "date が必要です" }, { status: 400 });
  }
  const data = await deleteCareRecord(itemId, date);
  return NextResponse.json(data);
}
