// 伺服器與瀏覽器各自的 locale 字串格式不一致（例如 Node 會插入 U+2009 thin space），
// 也可能處於不同時區。這裡用固定時區並以 formatToParts 自行組字串，兩端輸出完全相同。
const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(iso: string): string {
  const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  const hour = p.hour === "24" ? "00" : p.hour;
  return `${p.year}/${p.month}/${p.day} ${hour}:${p.minute}`;
}
