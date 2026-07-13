"use client";

import { useEffect, useState } from "react";
import { CARE_ITEMS, OVERDUE_DAYS, type CareData, type CareItemId } from "@/lib/careTypes";

const NOTIFY_KEY = "leatherCareLastNotified";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date(todayStr() + "T00:00:00");
  return Math.round((now.getTime() - then.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function sortedRecords(data: CareData, id: CareItemId): string[] {
  return (data[id] || []).slice().sort((a, b) => (a < b ? 1 : -1));
}

export default function CareApp({ initialData }: { initialData: CareData }) {
  const [data, setData] = useState<CareData>(initialData);
  const [pending, setPending] = useState<CareItemId | null>(null);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotifyPermission("unsupported");
      return;
    }
    setNotifyPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (notifyPermission !== "granted") return;
    const overdue = CARE_ITEMS.filter((item) => {
      const records = sortedRecords(data, item.id);
      return records.length > 0 && daysSince(records[0]) >= OVERDUE_DAYS;
    });
    if (overdue.length === 0) return;
    const today = todayStr();
    if (localStorage.getItem(NOTIFY_KEY) === today) return;
    const names = overdue.map((i) => i.name).join("、");
    new Notification("革製品のケア時期です", {
      body: `${names} のケアから1ヶ月以上経過しています。`,
    });
    localStorage.setItem(NOTIFY_KEY, today);
  }, [data, notifyPermission]);

  async function recordToday(id: CareItemId) {
    setPending(id);
    try {
      const res = await fetch(`/api/care/${id}`, { method: "POST" });
      if (res.ok) setData(await res.json());
    } finally {
      setPending(null);
    }
  }

  async function deleteRecord(id: CareItemId, date: string) {
    setPending(id);
    try {
      const res = await fetch(`/api/care/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (res.ok) setData(await res.json());
    } finally {
      setPending(null);
    }
  }

  async function enableNotify() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifyPermission(permission);
  }

  return (
    <>
      <main id="app">
        {CARE_ITEMS.map((item) => {
          const records = sortedRecords(data, item.id);
          const lastDate = records[0];
          const elapsed = lastDate ? daysSince(lastDate) : null;
          const isOverdue = elapsed !== null && elapsed >= OVERDUE_DAYS;
          const recordedToday = lastDate === todayStr();

          return (
            <section className="card" key={item.id}>
              <div className="card-header">
                <h2>{item.name}</h2>
                <span className={`status${isOverdue ? " overdue" : ""}`}>
                  {lastDate ? (isOverdue ? "ケアの目安（1ヶ月）を超えています" : "良好") : "記録なし"}
                </span>
              </div>

              <div className="card-body">
                <div>
                  {lastDate ? (
                    <>
                      <p className="last-care">最終ケア: {formatDate(lastDate)}</p>
                      <p className="days-elapsed">
                        {elapsed}
                        <span>日経過</span>
                      </p>
                    </>
                  ) : (
                    <p className="last-care">まだケアが記録されていません</p>
                  )}
                </div>
                <button
                  className="primary"
                  disabled={recordedToday || pending === item.id}
                  onClick={() => recordToday(item.id)}
                >
                  {recordedToday ? "本日は記録済み" : "今日ケアした"}
                </button>
              </div>

              <details className="history">
                <summary>ケア履歴（{records.length}件）</summary>
                {records.length === 0 ? (
                  <p className="empty-history">履歴はありません</p>
                ) : (
                  <ul className="history-list">
                    {records.map((dateStr) => (
                      <li key={dateStr}>
                        <span>{formatDate(dateStr)}</span>
                        <button className="delete-record" onClick={() => deleteRecord(item.id, dateStr)}>
                          削除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </section>
          );
        })}
      </main>

      <footer className="page-footer">
        <p className="sync-note">記録はサーバーに保存され、Mac・iPhoneどちらでも同じ内容が表示されます</p>
        {notifyPermission === "unsupported" ? (
          <p className="notify-status">この端末・ブラウザは通知に対応していません</p>
        ) : notifyPermission === "granted" ? (
          <>
            <button className="link-button" disabled>
              通知は有効です
            </button>
            <p className="notify-status">このページを開いた時に、ケアから1ヶ月以上経過していると通知します</p>
          </>
        ) : notifyPermission === "denied" ? (
          <>
            <button className="link-button" disabled>
              通知が拒否されています
            </button>
            <p className="notify-status">端末の設定から通知を許可してください</p>
          </>
        ) : (
          <button className="link-button" onClick={enableNotify}>
            通知を有効にする
          </button>
        )}
      </footer>
    </>
  );
}
