import { put, get } from "@vercel/blob";
import type { CareData } from "./careTypes";

const CARE_BLOB_PATH = "data/care.json";

export async function readCareFromBlob(): Promise<Partial<CareData>> {
  try {
    const result = await get(CARE_BLOB_PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return {};
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Partial<CareData>;
  } catch {
    return {};
  }
}

export async function writeCareToBlob(data: CareData): Promise<void> {
  await put(CARE_BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
