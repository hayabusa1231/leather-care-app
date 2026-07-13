export type CareItemId = "gh-bass-larson" | "herz-dulles";

export interface CareItem {
  id: CareItemId;
  name: string;
}

export const CARE_ITEMS: CareItem[] = [
  { id: "gh-bass-larson", name: "GH Bass Larson" },
  { id: "herz-dulles", name: "HERZ ダレスリュック" },
];

export const OVERDUE_DAYS = 30;

export type CareData = Record<CareItemId, string[]>;
