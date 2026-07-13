import { promises as fs } from "fs";
import path from "path";
import { CARE_ITEMS, type CareData, type CareItemId } from "./careTypes";
import { readCareFromBlob, writeCareToBlob } from "./blobStorage";

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const DATA_FILE = path.join(process.cwd(), "data", "care.json");

function emptyData(): CareData {
  const data = {} as CareData;
  for (const item of CARE_ITEMS) {
    data[item.id] = [];
  }
  return data;
}

async function readAll(): Promise<CareData> {
  if (USE_BLOB) {
    const data = await readCareFromBlob();
    return { ...emptyData(), ...data };
  }
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return { ...emptyData(), ...JSON.parse(raw) };
  } catch {
    return emptyData();
  }
}

async function writeAll(data: CareData): Promise<void> {
  if (USE_BLOB) {
    await writeCareToBlob(data);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN が設定されていません。VercelのStorageでBlobを作成・接続してから再デプロイしてください。"
    );
  }
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCareData(): Promise<CareData> {
  return readAll();
}

export async function addCareRecord(itemId: CareItemId, date: string): Promise<CareData> {
  const data = await readAll();
  const records = data[itemId] ?? [];
  if (!records.includes(date)) {
    records.push(date);
  }
  data[itemId] = records;
  await writeAll(data);
  return data;
}

export async function deleteCareRecord(itemId: CareItemId, date: string): Promise<CareData> {
  const data = await readAll();
  data[itemId] = (data[itemId] ?? []).filter((d) => d !== date);
  await writeAll(data);
  return data;
}
