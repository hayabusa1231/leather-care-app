const STORAGE_KEY = "leatherCareData";
const NOTIFY_KEY = "leatherCareLastNotified";
const OVERDUE_DAYS = 30;

const ITEMS = [
  { id: "gh-bass-larson", name: "GH Bass Larson" },
  { id: "herz-dulles", name: "HERZ ダレスリュック" },
];

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date(todayStr() + "T00:00:00");
  return Math.round((now - then) / 86400000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getRecords(data, id) {
  return (data[id] || []).slice().sort((a, b) => (a < b ? 1 : -1));
}

function addRecord(id) {
  const data = loadData();
  const records = data[id] || [];
  const today = todayStr();
  if (!records.includes(today)) {
    records.push(today);
    data[id] = records;
    saveData(data);
  }
  render();
}

function deleteRecord(id, dateStr) {
  const data = loadData();
  data[id] = (data[id] || []).filter((d) => d !== dateStr);
  saveData(data);
  render();
}

function render() {
  const data = loadData();
  const app = document.getElementById("app");
  app.innerHTML = "";

  ITEMS.forEach((item) => {
    const records = getRecords(data, item.id);
    const lastDate = records[0];
    const elapsed = lastDate ? daysSince(lastDate) : null;
    const isOverdue = elapsed !== null && elapsed >= OVERDUE_DAYS;
    const recordedToday = lastDate === todayStr();

    const card = document.createElement("section");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    header.innerHTML = `
      <h2>${item.name}</h2>
      <span class="status${isOverdue ? " overdue" : ""}">
        ${lastDate ? (isOverdue ? "ケアの目安（1ヶ月）を超えています" : "良好") : "記録なし"}
      </span>
    `;

    const body = document.createElement("div");
    body.className = "card-body";

    const info = document.createElement("div");
    info.innerHTML = lastDate
      ? `<p class="last-care">最終ケア: ${formatDate(lastDate)}</p>
         <p class="days-elapsed">${elapsed}<span>日経過</span></p>`
      : `<p class="last-care">まだケアが記録されていません</p>`;

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = recordedToday ? "本日は記録済み" : "今日ケアした";
    btn.disabled = recordedToday;
    btn.addEventListener("click", () => addRecord(item.id));

    body.appendChild(info);
    body.appendChild(btn);

    const historyDetails = document.createElement("details");
    historyDetails.className = "history";
    const summary = document.createElement("summary");
    summary.textContent = `ケア履歴（${records.length}件）`;
    historyDetails.appendChild(summary);

    if (records.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-history";
      empty.textContent = "履歴はありません";
      historyDetails.appendChild(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "history-list";
      records.forEach((dateStr) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = formatDate(dateStr);
        const del = document.createElement("button");
        del.className = "delete-record";
        del.textContent = "削除";
        del.addEventListener("click", () => deleteRecord(item.id, dateStr));
        li.appendChild(span);
        li.appendChild(del);
        list.appendChild(li);
      });
      historyDetails.appendChild(list);
    }

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(historyDetails);
    app.appendChild(card);
  });

  checkOverdueNotification(data);
}

function getOverdueItems(data) {
  return ITEMS.filter((item) => {
    const records = getRecords(data, item.id);
    if (records.length === 0) return false;
    return daysSince(records[0]) >= OVERDUE_DAYS;
  });
}

function checkOverdueNotification(data) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const overdue = getOverdueItems(data);
  if (overdue.length === 0) return;

  const today = todayStr();
  if (localStorage.getItem(NOTIFY_KEY) === today) return;

  const names = overdue.map((i) => i.name).join("、");
  new Notification("革製品のケア時期です", {
    body: `${names} のケアから1ヶ月以上経過しています。`,
  });
  localStorage.setItem(NOTIFY_KEY, today);
}

function updateNotifyStatus() {
  const statusEl = document.getElementById("notify-status");
  const toggleBtn = document.getElementById("notify-toggle");
  if (!("Notification" in window)) {
    statusEl.textContent = "この端末・ブラウザは通知に対応していません";
    toggleBtn.disabled = true;
    return;
  }
  if (Notification.permission === "granted") {
    toggleBtn.textContent = "通知は有効です";
    toggleBtn.disabled = true;
    statusEl.textContent = "このページを開いた時に、ケアから1ヶ月以上経過していると通知します";
  } else if (Notification.permission === "denied") {
    toggleBtn.textContent = "通知が拒否されています";
    toggleBtn.disabled = true;
    statusEl.textContent = "端末の設定から通知を許可してください";
  } else {
    toggleBtn.textContent = "通知を有効にする";
    toggleBtn.disabled = false;
    statusEl.textContent = "";
  }
}

document.getElementById("notify-toggle").addEventListener("click", async () => {
  if (!("Notification" in window)) return;
  await Notification.requestPermission();
  updateNotifyStatus();
  render();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

updateNotifyStatus();
render();
