import { put, list } from "@vercel/blob";
import type { CareData } from "./careTypes";

const CARE_BLOB_PATH = "data/care.json";

export async function readCareFromBlob(): Promise<Partial<CareData>> {
  const { blobs } = await list({ prefix: CARE_BLOB_PATH, limit: 1 });
  const match = blobs.find((b) => b.pathname === CARE_BLOB_PATH);
  if (!match) return {};
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return {};
  return (await res.json()) as Partial<CareData>;
}

export async function writeCareToBlob(data: CareData): Promise<void> {
  await put(CARE_BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
